'use server';

import { deleteUser as dbDeleteUser } from '@/lib/actions/data/user';
import { deleteRecords as dbDeleteRecords } from '@/lib/actions/data/record';
import { deleteActivities as dbDeleteActivities } from '@/lib/actions/data/activity';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { getUserId } from '@/lib/actions/auth/utils/get-user-id';

export async function deleteUserData() {
  try {
    const userId = await getUserId();
    await Promise.all([
      dbDeleteActivities(userId),
      dbDeleteRecords(userId),
      dbDeleteUser(userId),
    ]);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
