'use server';

import { Activity } from '@/lib/definitions';
import { ActivitySchema } from '@/lib/validation';
import {
  createActivity as dbCreateActivity,
  getActivities as dbGetActivities,
  updateActivity as dbUpdateActivity,
  deleteActivity as dbDeleteActivity,
} from '@/lib/actions/data/activity';
import {
  getRecord as dbGetRecord,
  deleteActivityRecords as dbDeleteActivityRecords,
} from '@/lib/actions/data/record';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong.';

export async function getActivities(userId: string) {
  try {
    const [record, activities] = await Promise.all([
      dbGetRecord(userId),
      dbGetActivities(userId),
    ]);

    if (!record) return activities;

    return activities.map((activity) => ({
      ...activity,
      timeSpent: record.activities[activity.id] || null,
    }));
  } catch (error: unknown) {
    return { message: 'Something went wrong.' };
  }
}

export async function createActivity(activity: Partial<Activity>) {
  const validatedFields = ActivitySchema.safeParse(activity);

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    return await dbCreateActivity(activity);
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}

export async function updateActivity(id: string, activity: Partial<Activity>) {
  const validatedFields = ActivitySchema.safeParse(activity);

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    return await dbUpdateActivity(id, activity);
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}

export async function deleteActivity(userId: string, activityId: string) {
  try {
    await Promise.all([
      dbDeleteActivity(activityId),
      dbDeleteActivityRecords(userId, activityId),
    ])
    return true;
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}
