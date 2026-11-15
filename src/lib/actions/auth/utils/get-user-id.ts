import 'server-only';

import { auth } from '@/auth';

// Entry points (pages, layouts, server actions) take the user id from the
// session and pass it down to the data layer. Server actions are public
// endpoints, so they must never accept the user id as an argument.
export const getUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('Unauthorized.');

  return userId;
};
