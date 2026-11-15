import 'server-only';
import { sql } from '@vercel/postgres';
import { generateKeyBetween } from 'fractional-indexing';

import type { Activity, ActivityFields } from '@/lib/db/types';

export async function listActivities(userId: string): Promise<Activity[]> {
  try {
    // id makes the order stable if two activities ever get the same position
    const result = await sql<Activity>`
      SELECT * FROM activity
      WHERE user_id=${userId}
      ORDER BY position, id`;
    return result.rows;
  } catch (error) {
    console.error('DB: Failed to fetch activities:', error);
    throw new Error('Failed to fetch activities.');
  }
}

// A new activity goes to the end of the list.
export async function createActivity(
  userId: string,
  { name, color, icon }: ActivityFields,
): Promise<Activity> {
  try {
    const last = await sql<Pick<Activity, 'position'>>`
      SELECT position FROM activity
      WHERE user_id=${userId}
      ORDER BY position DESC
      LIMIT 1`;
    const position = generateKeyBetween(last.rows[0]?.position ?? null, null);

    const result = await sql<Activity>`
      INSERT INTO activity(user_id, name, color, icon, position)
      VALUES (${userId}, ${name}, ${color}, ${icon}, ${position})
      RETURNING *`;
    return result.rows[0];
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

// Moves an activity between two neighbours. Only this one row is updated.
// `beforeId`/`afterId` are the activities that should end up right before
// and after it (null at the edges of the list).
export async function moveActivity(
  userId: string,
  id: string,
  { beforeId, afterId }: { beforeId: string | null; afterId: string | null },
): Promise<Activity | undefined> {
  try {
    const neighbourIds = [beforeId, afterId].filter(
      (neighbourId) => neighbourId !== null,
    );
    const neighbours = await sql.query<Pick<Activity, 'id' | 'position'>>(
      `SELECT id, position FROM activity
      WHERE user_id=$1 AND id = ANY($2::uuid[])`,
      [userId, neighbourIds],
    );
    const positionOf = (neighbourId: string | null) =>
      neighbours.rows.find((row) => row.id === neighbourId)?.position ?? null;

    const position = generateKeyBetween(
      positionOf(beforeId),
      positionOf(afterId),
    );

    const result = await sql<Activity>`
      UPDATE activity SET position=${position}, updated_at=now()
      WHERE id=${id} AND user_id=${userId}
      RETURNING *`;
    return result.rows[0];
  } catch (error) {
    console.error('DB: Failed to move activity:', error);
    throw new Error('Failed to move activity.');
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
