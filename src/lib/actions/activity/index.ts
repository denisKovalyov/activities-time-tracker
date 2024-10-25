'use server';

import { Activity, ActivityExtended } from '@/lib/definitions';
import { ActivitySchema, EditActivitySchema } from '@/lib/validation';
import {
  createActivity as dbCreateActivity,
  getActivities as dbGetActivities,
  updateActivity as dbUpdateActivity,
  reorderActivities as dbReorderActivities,
  deleteActivity as dbDeleteActivity,
} from '@/lib/actions/data/activity';
import {
  getRecord as dbGetRecord,
  deleteActivityRecords as dbDeleteActivityRecords,
} from '@/lib/actions/data/record';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export async function getActivities(
  userId: string,
  date: Date,
): Promise<ActivityExtended[] | { message: string }> {
  try {
    const [record, activities] = await Promise.all([
      dbGetRecord(userId, date),
      dbGetActivities(userId),
    ]);

    return activities.map((activity) => ({
      ...activity,
      timeSpent: record?.activities?.[activity.id] || 0,
    }));
  } catch (error: unknown) {
    return { message: 'Something went wrong.' };
  }
}

export async function createActivity(
  activity: Pick<Activity, 'user_id' | 'name' | 'color' | 'icon' | 'order'>,
) {
  const validatedFields = ActivitySchema.safeParse(activity);

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    return await dbCreateActivity(activity);
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
    return await dbUpdateActivity(id, activity);
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function reorderActivities(
  activitiesList: { id: string; order: number }[],
) {
  try {
    await dbReorderActivities(activitiesList);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}

export async function deleteActivity(userId: string, activityId: string) {
  try {
    await Promise.all([
      dbDeleteActivity(activityId),
      dbDeleteActivityRecords(userId, activityId),
    ]);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
