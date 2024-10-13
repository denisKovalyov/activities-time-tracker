'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ACTIVITIES_PATH = '/dashboard';

export async function revalidateActivities() {
  revalidatePath(ACTIVITIES_PATH);
  redirect(ACTIVITIES_PATH);
}
