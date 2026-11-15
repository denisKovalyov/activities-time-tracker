import 'server-only';

import { getRecord as dbGetRecord } from '@/lib/actions/data/record';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { ActivityRecord } from '@/lib/definitions';

export async function getRecord(
  userId: string,
  date: Date,
): Promise<ActivityRecord | { message: string } | undefined> {
  try {
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
