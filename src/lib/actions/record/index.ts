'use server';

import {
  getRecord as dbGetRecord,
  createRecord as dbCreateRecord,
  updateRecord as dbUpdateRecord,
} from '@/lib/actions/data/record';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { ActivityRecord } from '@/lib/definitions';
import { CreateUpdateRecordParams } from '@/lib/actions/data/types';
import { getUserId } from '@/lib/actions/auth/utils/get-user-id';

type RecordParams = Omit<CreateUpdateRecordParams, 'userId'>;

export async function getRecord(
  date: Date,
): Promise<ActivityRecord | { message: string } | undefined> {
  try {
    const userId = await getUserId();
    return await dbGetRecord(userId, date);
  } catch (error: unknown) {
    return {
      message:
        error instanceof Error
          ? (error?.message as string)
          : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function createNewRecord({
  date,
  currentActivity,
  activityRecord,
}: RecordParams) {
  try {
    const userId = await getUserId();
    const id = await dbCreateRecord({
      userId,
      date,
      currentActivity,
      activityRecord,
    });
    return { success: true, id };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function updateRecord({
  date,
  currentActivity,
  activityRecord,
}: RecordParams) {
  try {
    const userId = await getUserId();
    await dbUpdateRecord({ userId, date, currentActivity, activityRecord });
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
