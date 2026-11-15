import 'server-only';
import { sql } from '@vercel/postgres';

import type { Activity } from '@/lib/definitions';

export async function getActivities(userId: string): Promise<Activity[] | []> {
  try {
    const activities =
      await sql<Activity>`SELECT * FROM activity WHERE user_id=${userId} ORDER BY "order" ASC`;
    return activities.rows;
  } catch (error) {
    console.error('DB: Failed to fetch activities:', error);
    throw new Error('Failed to fetch activities.');
  }
}

export async function createActivity({
  user_id,
  name,
  color,
  icon,
  order,
}: Partial<Activity>): Promise<Activity> {
  try {
    const date = new Date().toISOString();

    const result = await sql`
      INSERT INTO activity(user_id, name, color, icon, "order", created_at, updated_at)
      VALUES (${user_id}, ${name}, ${color}, ${icon}, ${order}, ${date}, ${date})
      RETURNING *`;

    return result.rows[0] as Activity;
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
  activity: Partial<Pick<Activity, (typeof UPDATABLE_FIELDS)[number]>>,
): Promise<Activity> {
  try {
    const fields = UPDATABLE_FIELDS.filter(
      (field) => activity[field] !== undefined,
    );
    const setString = [...fields, 'updated_at']
      .map((field, i) => `${field}=$${i + 1}`)
      .join(', ');
    const values = [
      ...fields.map((field) => activity[field]),
      new Date().toISOString(),
      id,
      userId,
    ];

    const result = await sql.query(
      `UPDATE activity SET ${setString}
      WHERE id=$${values.length - 1} AND user_id=$${values.length}
      RETURNING *`,
      values,
    );

    return result.rows[0];
  } catch (error) {
    console.error('DB: failed to update activity:', error);
    throw new Error('Failed to update activity.');
  }
}

export async function reorderActivities(
  userId: string,
  activitiesList: { id: string; order: number }[],
): Promise<Activity[]> {
  try {
    const ids = activitiesList.map(({ id }) => id);
    const orders = activitiesList.map(({ order }) => order);

    const result = await sql.query(
      `UPDATE activity SET "order" = data.new_order, updated_at = now()
      FROM unnest($1::uuid[], $2::int[]) AS data(id, new_order)
      WHERE activity.id = data.id AND activity.user_id = $3
      RETURNING *`,
      [ids, orders, userId],
    );

    return result.rows;
  } catch (error) {
    console.error('DB: failed to update order of activities:', error);
    throw new Error('Failed to update order of activities.');
  }
}

export async function deleteActivity(
  userId: string,
  id: string,
): Promise<void> {
  try {
    await sql`DELETE FROM activity WHERE id=${id} AND user_id=${userId}`;
  } catch (error) {
    console.error('DB: failed to delete activity:', error);
    throw new Error('Failed to delete activity.');
  }
}

export async function deleteActivities(userId: string): Promise<void> {
  try {
    await sql`DELETE FROM activity WHERE user_id=${userId}`;
  } catch (error) {
    console.error('DB: failed to delete activities:', error);
    throw new Error('Failed to delete activities.');
  }
}
