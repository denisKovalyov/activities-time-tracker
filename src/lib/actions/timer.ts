'use server';

import { z } from 'zod';

import { dbStartTimer, dbStopTimer } from '@/lib/db/time-entries';
import { getUserId } from '@/lib/actions/utils/get-user-id';
import { revalidateUserData } from '@/lib/actions/utils/revalidate';
import {
  type ActionResult,
  failure,
  success,
} from '@/lib/actions/utils/result';

export async function startTimer(activityId: string): Promise<ActionResult> {
  const validatedId = z.string().uuid().safeParse(activityId);
  if (!validatedId.success) return failure(new Error('Invalid activity.'));

  try {
    const userId = await getUserId();
    await dbStartTimer(userId, validatedId.data);
    revalidateUserData();
    return success(undefined);
  } catch (error) {
    return failure(error);
  }
}

export async function stopTimer(): Promise<ActionResult> {
  try {
    const userId = await getUserId();
    await dbStopTimer(userId);
    revalidateUserData();
    return success(undefined);
  } catch (error) {
    return failure(error);
  }
}
