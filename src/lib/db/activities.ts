import 'server-only';
import { sql, type VercelPoolClient } from '@vercel/postgres';
import { generateKeyBetween } from 'fractional-indexing';

import { withUserLock } from '@/lib/db/transaction';
import type { Activity, ActivityFields, Move } from '@/lib/db/types';

export async function listActivities(userId: string): Promise<Activity[]> {
  try {
    const result = await sql<Activity>`
      SELECT * FROM activity
      WHERE user_id=${userId}
      ORDER BY position`;
    return result.rows;
  } catch (error) {
    console.error('DB: Failed to fetch activities:', error);
    throw new Error('Failed to fetch activities.');
  }
}

// A new activity goes to the end of the list. Positions are chosen under the
// user lock, so two simultaneous creates can't get the same position.
export async function createActivity(
  userId: string,
  { name, color, icon }: ActivityFields,
): Promise<Activity> {
  try {
    return await withUserLock(userId, async (client) => {
      const last = await client.query<Pick<Activity, 'position'>>(
        `SELECT position FROM activity
        WHERE user_id=$1
        ORDER BY position DESC
        LIMIT 1`,
        [userId],
      );
      const position = generateKeyBetween(last.rows[0]?.position ?? null, null);

      const result = await client.query<Activity>(
        `INSERT INTO activity(user_id, name, color, icon, position)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [userId, name, color, icon, position],
      );
      return result.rows[0];
    });
  } catch (error) {
    console.error('DB: Failed to create activity:', error);
    throw new Error('Failed to create activity.');
  }
}

// Column names are interpolated into SQL, so they come only from this list.
const UPDATABLE_FIELDS = ['name', 'color', 'icon'] as const;

export async function updateActivity(
  userId: string,
  id: string,
  fields: Partial<ActivityFields>,
): Promise<Activity | undefined> {
  try {
    const names = UPDATABLE_FIELDS.filter((name) => fields[name] !== undefined);
    const setString = names
      .map((name, i) => `${name}=$${i + 1}`)
      .concat('updated_at=now()')
      .join(', ');
    const values = [...names.map((name) => fields[name]), id, userId];

    const result = await sql.query<Activity>(
      `UPDATE activity SET ${setString}
      WHERE id=$${values.length - 1} AND user_id=$${values.length}
      RETURNING *`,
      values,
    );
    return result.rows[0];
  } catch (error) {
    console.error('DB: Failed to update activity:', error);
    throw new Error('Failed to update activity.');
  }
}

// Puts an activity right after `previousId` (null moves it to the top).
// Only this one row is updated. The next neighbour is read from the database
// rather than taken from the client, so a stale list can't produce equal
// positions.
async function applyMove(
  client: VercelPoolClient,
  userId: string,
  { id, previousId }: Move,
): Promise<Activity | undefined> {
  let previousPosition: string | null = null;
  if (previousId) {
    const previous = await client.query<Pick<Activity, 'position'>>(
      'SELECT position FROM activity WHERE id=$1 AND user_id=$2',
      [previousId, userId],
    );
    if (!previous.rows[0]) throw new Error('Previous activity not found.');
    previousPosition = previous.rows[0].position;
  }

  const next = await client.query<Pick<Activity, 'position'>>(
    `SELECT position FROM activity
    WHERE user_id=$1 AND id<>$2 AND ($3::text IS NULL OR position > $3)
    ORDER BY position
    LIMIT 1`,
    [userId, id, previousPosition],
  );
  const position = generateKeyBetween(
    previousPosition,
    next.rows[0]?.position ?? null,
  );

  const result = await client.query<Activity>(
    `UPDATE activity SET position=$1, updated_at=now()
    WHERE id=$2 AND user_id=$3
    RETURNING *`,
    [position, id, userId],
  );
  return result.rows[0];
}

// Applies the moves in order, all or none: they run in one transaction under
// the user lock, so a failed move doesn't leave a half-applied order.
// Returns the moved activities (activities of other users are skipped).
export async function moveActivities(
  userId: string,
  moves: Move[],
): Promise<Activity[]> {
  try {
    return await withUserLock(userId, async (client) => {
      const moved: Activity[] = [];
      for (const move of moves) {
        const activity = await applyMove(client, userId, move);
        if (activity) moved.push(activity);
      }
      return moved;
    });
  } catch (error) {
    console.error('DB: Failed to move activities:', error);
    throw new Error('Failed to move activities.');
  }
}

// Time entries of the activity are removed by ON DELETE CASCADE.
export async function deleteActivity(userId: string, id: string) {
  try {
    await sql`DELETE FROM activity WHERE id=${id} AND user_id=${userId}`;
  } catch (error) {
    console.error('DB: Failed to delete activity:', error);
    throw new Error('Failed to delete activity.');
  }
}
