import 'server-only';

import { auth } from '@/auth';

export const getUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('Unauthorized.');

  return userId;
};
