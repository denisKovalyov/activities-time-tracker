'use server';

import { ActivityRecord } from '@/lib/definitions';
import { sql } from '@vercel/postgres';
import { formatDate } from '@/lib/actions/data/utils';

export async function hasRecord(
  userId: string,
  date: Date = new Date(),
): Promise<boolean> {
  try {
    const record =
      await sql`SELECT EXISTS(SELECT 1 FROM record WHERE user_id=${userId} AND date=${formatDate(date)})`;
    return record.rows[0].exists;
  } catch (error) {
    console.error('DB: Failed to check record existence:', error);
    throw new Error('Failed to check record existence.');
  }
}

export async function getRecord(
  userId: string,
  date: Date = new Date(),
): Promise<ActivityRecord | undefined> {
  try {
    const record =
      await sql<ActivityRecord>`SELECT * FROM record WHERE user_id=${userId} AND date=${formatDate(date)}`;
    return record.rows[0];
  } catch (error) {
    console.error('DB: Failed to fetch record:', error);
    throw new Error('Failed to fetch record.');
  }
}

export async function createRecord(
  userId: string,
  currentActivityId?: string | null,
  activityRecord?: [string, number] | null,
): Promise<string> {
  try {
    const record = await sql.query(
      `INSERT INTO record(user_id, current_activity, activities) VALUES($1, $2, $3) RETURNING *`,
      [
      userId,
      currentActivityId ? JSON.stringify([currentActivityId, formatDate(new Date()), true]) : null,
      activityRecord ? { [activityRecord[0]]: activityRecord[1] }: {},
    ]);
    return record.rows[0].id;
  } catch (error) {
    console.error('DB: Failed to create new record:', error);
    throw new Error('Failed to create new record.');
  }
}

export async function updateRecord(
  userId: string,
  currentActivityId: string | null,
  activityRecord?: [string, number] | null,
  date: Date = new Date(),
): Promise<void> {
  const [activityId, value] = activityRecord || [];

  const fields = activityRecord
    ? 'activities=jsonb_set(activities, $3, $4), current_activity=$5'
    : 'current_activity=$3';

  const values: (number | string | null)[] = [userId, formatDate(date)];
  const currentActivity = currentActivityId
    ? JSON.stringify([currentActivityId, formatDate(date, true)])
    : null;

  if (value) values.push('{' + activityId + '}', value, currentActivity);
  else values.push(currentActivity);

  try {
    await sql.query(
      `UPDATE record SET ${fields} WHERE user_id=$1 AND date=$2`,
      values,
    );
  } catch (error) {
    console.error('DB: failed to update record:', error);
    throw new Error('Failed to update record.');
  }
}

export async function deleteActivityRecords(
  userId: string,
  activityId: string,
): Promise<void> {
  try {
    await sql`UPDATE record
      SET activities=activities - ${activityId}
      WHERE user_id=${userId}`;
  } catch (error) {
    console.error('DB: failed to remove activity from record data:', error);
    throw new Error('Failed to remove activity from record data.');
  }
}
