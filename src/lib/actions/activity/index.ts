'use server';

import { z } from 'zod';

import {
  ActivitySchema,
  EditActivitySchema,
  ReorderActivitiesSchema,
} from '@/lib/validation';
import {
  createActivity as dbCreateActivity,
  updateActivity as dbUpdateActivity,
  reorderActivities as dbReorderActivities,
  deleteActivity as dbDeleteActivity,
} from '@/lib/actions/data/activity';
import { deleteActivityRecords as dbDeleteActivityRecords } from '@/lib/actions/data/record';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { getUserId } from '@/lib/actions/auth/utils/get-user-id';
import { Activity } from '@/lib/definitions';

const CreateActivitySchema = ActivitySchema.extend({
  order: z.number().int().nonnegative(),
});

export async function createActivity(
  activity: Pick<Activity, 'name' | 'color' | 'icon' | 'order'>,
) {
  const validatedFields = CreateActivitySchema.safeParse(activity);

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const userId = await getUserId();
    return await dbCreateActivity({
      ...validatedFields.data,
      user_id: userId,
    });
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function updateActivity(
  id: string,
  activity: Partial<Pick<Activity, 'name' | 'color' | 'icon'>>,
) {
  const validatedFields = EditActivitySchema.safeParse(activity);

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const userId = await getUserId();
    return await dbUpdateActivity(userId, id, validatedFields.data);
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function reorderActivities(
  activitiesList: { id: string; order: number }[],
) {
  const validatedFields = ReorderActivitiesSchema.safeParse(activitiesList);

  if (!validatedFields.success) {
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  try {
    const userId = await getUserId();
    await dbReorderActivities(userId, validatedFields.data);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function deleteActivity(activityId: string) {
  try {
    const userId = await getUserId();
    await Promise.all([
      dbDeleteActivity(userId, activityId),
      dbDeleteActivityRecords(userId, activityId),
    ]);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
