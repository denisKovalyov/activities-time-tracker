'use server';

import { sql } from '@vercel/postgres';

import { formatDate } from '@/lib/utils';
import { ActivityRecord } from '@/lib/definitions';
import { CreateUpdateRecordParams } from '@/lib/actions/data/types';

export async function getRecord(
  userId: string,
  date: Date,
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

export async function getRecords(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<ActivityRecord[] | []> {
  try {
    const record =
      await sql<ActivityRecord>`SELECT * FROM record WHERE user_id=${userId} AND date BETWEEN ${formatDate(endDate)} AND ${formatDate(startDate)}`;
    return record.rows;
  } catch (error) {
    console.error('DB: Failed to fetch record:', error);
    throw new Error('Failed to fetch record.');
  }
}

export async function createRecord({
  userId,
  date,
  currentActivity,
  activityRecord,
}: CreateUpdateRecordParams): Promise<string> {
  try {
    const record = await sql.query(
      `INSERT INTO record(user_id, date, current_activity, activities) VALUES($1, $2, $3, $4) RETURNING *`,
      [
      userId,
      formatDate(date),
        currentActivity ? JSON.stringify([currentActivity[0], currentActivity[1].toISOString()]) : null,
      activityRecord ? { [activityRecord[0]]: activityRecord[1] }: {},
    ]);
    return record.rows[0].id;
  } catch (error) {
    console.error('DB: Failed to create new record:', error);
    throw new Error('Failed to create new record.');
  }
}

export async function updateRecord({
  userId,
  date,
  currentActivity,
  activityRecord,
}: CreateUpdateRecordParams): Promise<void> {
  const [activityId, value] = activityRecord || [];

  const fields = activityRecord
    ? 'activities=jsonb_set(activities, $3, $4), current_activity=$5'
    : 'current_activity=$3';

  const values: (number | string | null)[] = [
    userId,
    formatDate(date),
  ];
  const currentActivityValue = currentActivity
    ? JSON.stringify([currentActivity[0], currentActivity[1].toISOString()])
    : null;

  if (value) values.push('{' + activityId + '}', value, currentActivityValue);
  else values.push(currentActivityValue);

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

export async function deleteRecords(
  userId: string,
): Promise<void> {
  try {
    await sql`DELETE FROM record WHERE user_id=${userId}`;
  } catch (error) {
    console.error('DB: failed to delete records:', error);
    throw new Error('Failed to delete records.');
  }
}
