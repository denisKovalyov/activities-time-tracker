'use server';

import { deleteUser as dbDeleteUser } from '@/lib/db/users';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { getUserId } from '@/lib/actions/utils/get-user-id';

export async function deleteUserData() {
  try {
    const userId = await getUserId();
    // Activities and time entries are removed by ON DELETE CASCADE
    await dbDeleteUser(userId);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
