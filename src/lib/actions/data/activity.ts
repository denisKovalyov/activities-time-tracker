import { sql } from '@vercel/postgres';

import { getUpdatedFields } from '@/lib/actions/data/utils';
import type { Activity, ActivityExtended } from '@/lib/definitions';

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

export async function updateActivity(
  id: string,
  activity: Partial<Activity>,
): Promise<Activity> {
  try {
    const updatedFields = {
      ...activity,
      updated_at: new Date().toISOString(),
    };

    const fieldsString = getUpdatedFields(updatedFields);

    const result = await sql.query(
      `UPDATE activity SET ${fieldsString} WHERE id='${id}' RETURNING *`,
      Object.values(updatedFields),
    );

    return result.rows[0];
  } catch (error) {
    console.error('DB: failed to update activity:', error);
    throw new Error('Failed to update activity.');
  }
}

export async function reorderActivities(
  activitiesList: { id: string; order: number }[],
): Promise<ActivityExtended[]> {
  try {
    const updatedAt = new Date().toISOString();
    const dataSet = activitiesList.reduce((str, { id, order}, i) => {
      const value = `('${id}'::uuid, ${order})`;
      return str + (i > 0 ? ', ' + value  : value);
    }, '');

    const result = await sql.query(`
      UPDATE activity SET "order" = data.new_order, updated_at = '${updatedAt}'
      FROM (VALUES ${dataSet}) AS data(id, new_order)
      WHERE activity.id = data.id
      RETURNING *;
    `);

    return result.rows;
  } catch (error) {
    console.error('DB: failed to update order of activities:', error);
    throw new Error('Failed to update order of activities.');
  }
}

export async function deleteActivity(id: string): Promise<void> {
  try {
    await sql`DELETE FROM activity WHERE id=${id}`;
  } catch (error) {
    console.error('DB: failed to delete activity:', error);
    throw new Error('Failed to delete activity.');
  }
}
