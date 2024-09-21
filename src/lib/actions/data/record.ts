'use server';

import { Record } from '@/lib/definitions';
import { sql } from '@vercel/postgres';
import { formatDate } from '@/lib/actions/data/utils';

export async function hasRecord(userId: string, date: Date = new Date()): Promise<boolean> {
  try {
    const record = await sql
      `SELECT EXISTS(SELECT 1 FROM record WHERE user_id=${userId} AND date=${formatDate(date)})`;
    return record.rows[0].exists;
  } catch (error) {
    console.error('DB: Failed to check record existence:', error);
    throw new Error('Failed to check record existence.');
  }
}

export async function getRecord(userId: string, date: Date = new Date()): Promise<Record> {
  try {
    const record = await sql<Record>
      `SELECT * FROM record WHERE user_id=${userId} AND date=${formatDate(date)}`;
    return record.rows[0];
  } catch (error) {
    console.error('DB: Failed to fetch record:', error);
    throw new Error('Failed to fetch record.');
  }
}

export async function createRecord(userId: string, data: {[key: string]: number} = {}): Promise<void> {
  try {
    await sql.query(
      `INSERT INTO record(user_id, activities) VALUES($1, $2)`,
      [userId, data]
    );
  } catch (error) {
    console.error('DB: Failed to create new record:', error);
    throw new Error('Failed to create new record.');
  }
}

export async function updateRecord(userId: string, activityId: string, value: number, date: Date = new Date()): Promise<void> {
  try {
    await sql.query(
      `UPDATE record
      SET activities=jsonb_set(activities, $3, $4)
      WHERE user_id=$1 AND date=$2`,
      [userId, formatDate(date), '{' + activityId + '}', value]
    );
  } catch (error) {
    console.error('DB: failed to update record:', error);
    throw new Error('Failed to update record.');
  }
}

export async function deleteActivityField(userId: string, activityId: string): Promise<void> {
  try {
    await sql`UPDATE record
      SET activities=activities - ${activityId}
      WHERE user_id=${userId}`
  } catch (error) {
    console.error('DB: failed to remove activity from record data:', error);
    throw new Error('Failed to remove activity from record data.');
  }
}
