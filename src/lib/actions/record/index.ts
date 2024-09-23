'use server';

import {
  createRecord as dbCreateRecord,
  updateRecord as dbUpdateRecord,
} from '@/lib/actions/data/record';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong.';

export async function createNewRecord(userId: string) {
  try {
    await dbCreateRecord(userId);
    return true;
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}

export async function recordActivityTime(userId: string, activityId: string, seconds: number, date?: Date) {
  try {
    await dbUpdateRecord(userId, activityId, seconds, date);
    return true;
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}
