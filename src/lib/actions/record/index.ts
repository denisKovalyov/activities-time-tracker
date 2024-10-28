'use server';

import {
  getRecord as dbGetRecord,
  createRecord as dbCreateRecord,
  updateRecord as dbUpdateRecord,
} from '@/lib/actions/data/record';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { ActivityRecord } from '@/lib/definitions';
import { CreateUpdateRecordParams } from '@/lib/actions/data/types';

export async function getRecord(
  userId: string,
  date: Date,
): Promise<ActivityRecord | { message: string } | undefined> {
  try {
    return await dbGetRecord(userId, date);
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message as string : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function createNewRecord({
  userId,
  date,
  currentActivity,
  activityRecord,
}: CreateUpdateRecordParams) {
  try {
    const id = await dbCreateRecord({ userId, date, currentActivity, activityRecord });
    return { success: true, id };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function updateRecord({
  userId,
  date,
  currentActivity,
  activityRecord,
}: CreateUpdateRecordParams) {
  try {
    await dbUpdateRecord({ userId, date, currentActivity, activityRecord });
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
