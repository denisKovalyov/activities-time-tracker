import 'server-only';

import { auth } from '@/auth';

// Takes the user id from the session on the server. Server actions are public
// endpoints, so they must never accept it as an argument.
export const getUserId = async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error('Unauthorized.');

  return userId;
};
