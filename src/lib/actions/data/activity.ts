import type { Activity } from '@/lib/definitions';
import { sql } from '@vercel/postgres';
import { getUpdatedFields } from '@/lib/actions/data/utils';

export async function getActivities(userId: string): Promise<Activity[] | []> {
  try {
    const activities = await sql<Activity>`SELECT * FROM activity WHERE user_id=${userId}`;
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
}: Partial<Activity>): Promise<void> {
  try {
    const date = new Date().toISOString();

    await sql`
      INSERT INTO activity(user_id, name, color, icon, created_at, updated_at)
      VALUES (${user_id}, ${name}, ${color}, ${icon}, ${date}, ${date})`;
  } catch (error) {
    console.error('DB: Failed to create activity:', error);
    throw new Error('Failed to create activity.');
  }
}

export async function updateActivity(id: string, activity: Partial<Activity>): Promise<void> {
  try {
    const updatedFields = {
      ...activity,
      updated_at: new Date().toISOString(),
    };

    const fieldsString = getUpdatedFields(updatedFields);

    await sql.query(
      `UPDATE activity SET ${fieldsString} WHERE id='${id}'`,
      Object.values(updatedFields),
    );
  } catch (error) {
    console.error('DB: failed to update activity:', error);
    throw new Error('Failed to update activity.');
  }
}

export async function deleteActivity(id: string): Promise<void> {
  try {
    await sql.query(`DELETE FROM TABLE activity WHERE id='${id}'`);
  } catch (error) {
    console.error('DB: failed to delete activity:', error);
    throw new Error('Failed to delete activity.');
  }
}
