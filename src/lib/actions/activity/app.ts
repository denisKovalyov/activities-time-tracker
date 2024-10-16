'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ACTIVITIES_PATH = '/dashboard';

export async function refetchActivities() {
  await revalidatePath(ACTIVITIES_PATH);
}

export async function goToActivitiesPage() {
  redirect(ACTIVITIES_PATH);
}
