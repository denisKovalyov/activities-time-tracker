'use server';

import { z } from 'zod';

import {
  dbCreateActivity,
  dbDeleteActivity,
  dbMoveActivities,
  dbUpdateActivity,
} from '@/lib/db/activities';
import type { Activity, ActivityFields, Move } from '@/lib/db/types';
import { ActivitySchema, EditActivitySchema } from '@/lib/validation';
import { getUserId } from '@/lib/actions/utils/get-user-id';
import { revalidateUserData } from '@/lib/actions/utils/revalidate';
import {
  type ActionResult,
  failure,
  success,
} from '@/lib/actions/utils/result';

const IdSchema = z.string().uuid();

const MovesSchema = z.array(
  z.object({ id: IdSchema, previousId: IdSchema.nullable() }),
);

const INVALID_DATA = new Error('Invalid data.');

export async function createActivity(
  fields: ActivityFields,
): Promise<ActionResult<Activity>> {
  const validatedFields = ActivitySchema.safeParse(fields);
  if (!validatedFields.success) {
    return failure(INVALID_DATA, validatedFields.error.flatten().fieldErrors);
  }

  try {
    const userId = await getUserId();
    const activity = await dbCreateActivity(userId, validatedFields.data);
    revalidateUserData();
    return success(activity);
  } catch (error) {
    return failure(error);
  }
}

export async function updateActivity(
  id: string,
  fields: Partial<ActivityFields>,
): Promise<ActionResult<Activity>> {
  const validatedId = IdSchema.safeParse(id);
  const validatedFields = EditActivitySchema.safeParse(fields);
  if (!validatedId.success) return failure(INVALID_DATA);
  if (!validatedFields.success) {
    return failure(INVALID_DATA, validatedFields.error.flatten().fieldErrors);
  }

  try {
    const userId = await getUserId();
    const activity = await dbUpdateActivity(
      userId,
      validatedId.data,
      validatedFields.data,
    );
    if (!activity) return failure(new Error('Activity not found.'));
    revalidateUserData();
    return success(activity);
  } catch (error) {
    return failure(error);
  }
}

export async function reorderActivities(moves: Move[]): Promise<ActionResult> {
  const validatedMoves = MovesSchema.safeParse(moves);
  if (!validatedMoves.success) return failure(INVALID_DATA);

  try {
    const userId = await getUserId();
    await dbMoveActivities(userId, validatedMoves.data);
    revalidateUserData();
    return success(undefined);
  } catch (error) {
    // The list may be stale (e.g. an activity was deleted in another tab)
    revalidateUserData();
    return failure(error);
  }
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  const validatedId = IdSchema.safeParse(id);
  if (!validatedId.success) return failure(INVALID_DATA);

  try {
    const userId = await getUserId();
    await dbDeleteActivity(userId, validatedId.data);
    revalidateUserData();
    return success(undefined);
  } catch (error) {
    return failure(error);
  }
}
