'use server';

import {
  getRecord as dbGetRecord,
  createRecord as dbCreateRecord,
  updateRecord as dbUpdateRecord,
} from '@/lib/actions/data/record';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { ActivityRecord } from '@/lib/definitions';

export async function getRecord(
  userId: string
): Promise<ActivityRecord | { message: string } | undefined> {
  try {
    return await dbGetRecord(userId);
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function createNewRecord(userId: string, currentActivityId?: string | null, activityRecord?: [string, number] | null) {
  try {
    const id = await dbCreateRecord(userId, currentActivityId, activityRecord);
    return { success: true, id };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function updateRecord(userId: string, currentActivityId: string | null, activityRecord?: [string, number] | null) {
  try {
    await dbUpdateRecord(userId, currentActivityId, activityRecord);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
