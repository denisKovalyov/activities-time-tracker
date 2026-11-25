import 'server-only';
import { sql, type VercelPoolClient } from '@vercel/postgres';
import { generateKeyBetween } from 'fractional-indexing';

import { withUserLock } from '@/lib/db/transaction';
import type { Activity, ActivityFields, Move } from '@/lib/types';

export async function dbListActivities(userId: string): Promise<Activity[]> {
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

// Adds to the end of the list. The user lock stops two simultaneous creating
// from getting the same position.
export async function dbCreateActivity(
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

// Column names are interpolated into SQL, so they come only from this list
const UPDATABLE_FIELDS = ['name', 'color', 'icon'] as const;

export async function dbUpdateActivity(
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

    // The id comes from the client, while user_id is taken from the session on
    // the server, so users can edit and delete only their own activities
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

const queryPosition = async (
  client: VercelPoolClient,
  userId: string,
  id: string,
): Promise<string> => {
  const result = await client.query<Pick<Activity, 'position'>>(
    'SELECT position FROM activity WHERE id=$1 AND user_id=$2',
    [id, userId],
  );
  if (!result.rows[0]) throw new Error('Previous activity not found.');
  return result.rows[0].position;
};

// The next neighbor: the first activity after the previous one (or the first
// one if there's no previous), skipping the moved activity
const queryNextPosition = async (
  client: VercelPoolClient,
  userId: string,
  after: string | null,
  movingId: string,
): Promise<string | null> => {
  const result = await client.query<Pick<Activity, 'position'>>(
    `SELECT position FROM activity
    WHERE user_id=$1 AND id<>$2 AND ($3::text IS NULL OR position > $3)
    ORDER BY position
    LIMIT 1`,
    [userId, movingId, after],
  );
  return result.rows[0]?.position ?? null;
};

// Puts the activity between `previousId` and the activity after it. The next
// neighbor is read from the database, not taken from the client, so a stale
// list can't produce equal positions.
const applyMove = async (
  client: VercelPoolClient,
  userId: string,
  { id, previousId }: Move,
): Promise<Activity | undefined> => {
  const previousPosition = previousId
    ? await queryPosition(client, userId, previousId)
    : null;
  const nextPosition = await queryNextPosition(
    client,
    userId,
    previousPosition,
    id,
  );
  const position = generateKeyBetween(previousPosition, nextPosition);

  const result = await client.query<Activity>(
    `UPDATE activity SET position=$1, updated_at=now()
    WHERE id=$2 AND user_id=$3
    RETURNING *`,
    [position, id, userId],
  );
  return result.rows[0];
};

// All or none: a move of a missing activity (e.g. deleted in another tab) or
// of another user's activity fails the whole batch.
export async function dbMoveActivities(
  userId: string,
  moves: Move[],
): Promise<Activity[]> {
  try {
    return await withUserLock(userId, async (client) => {
      const moved: Activity[] = [];
      for (const move of moves) {
        const activity = await applyMove(client, userId, move);
        if (!activity) throw new Error('Activity not found.');
        moved.push(activity);
      }
      return moved;
    });
  } catch (error) {
    console.error('DB: Failed to move activities:', error);
    throw new Error('Failed to move activities.');
  }
}

// Its time entries are removed by ON DELETE CASCADE
export async function dbDeleteActivity(userId: string, id: string) {
  try {
    await sql`DELETE FROM activity WHERE id=${id} AND user_id=${userId}`;
  } catch (error) {
    console.error('DB: Failed to delete activity:', error);
    throw new Error('Failed to delete activity.');
  }
}
