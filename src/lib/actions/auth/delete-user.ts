import { deleteUser as dbDeleteUser } from '@/lib/actions/data/user';
import { deleteRecords as dbDeleteRecords } from '@/lib/actions/data/record';
import { deleteActivities as dbDeleteActivities } from '@/lib/actions/data/activity';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export async function deleteUser(userId: string) {
  try {
    await Promise.all([
      dbDeleteActivities(userId),
      dbDeleteRecords(userId),
    ]);
    await dbDeleteUser(userId);
    return { success: true };
  } catch (error: unknown) {
    return {
      message: error instanceof Error ? error?.message : DEFAULT_ERROR_MESSAGE,
    };
  }
}
