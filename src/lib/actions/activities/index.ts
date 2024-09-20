'use server';

import { Activity } from '@/lib/definitions';
import { CreateActivitySchema } from '@/lib/validation';
import {
  createActivity as dbCreateActivity,
  getActivities as dbGetActivities,
  updateActivity as dbUpdateActivity,
  deleteActivity as dbDeleteActivity,
} from '@/lib/actions/data/activity';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong.';

export async function getActivities(userId: string) {
  try {
    const activities = await dbGetActivities(userId);
    return activities;
  } catch (error: unknown) {
    return { message: 'Something went wrong.' };
  }
}

export async function createActivity(activity: Partial<Activity>) {
  const validatedFields = CreateActivitySchema.safeParse(activity);

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await dbCreateActivity(activity);
    return true;
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}

export async function updateActivity(id: string, activity: Partial<Activity>) {
  const validatedFields = CreateActivitySchema.safeParse(activity);

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await dbUpdateActivity(id, activity);
    return true;
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}

export async function deleteActivity(id: string) {
  try {
    await dbDeleteActivity(id);
    return true;
  } catch (error: unknown) {
    return { message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE };
  }
}
