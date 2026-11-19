import 'server-only';

import { dbGetUser } from '@/lib/db/users';

// Not a server action (public endpoint), to prevent checking which emails are
// registered. A missing user counts as verified: sign-in then reports invalid
// credentials.
export const isUsersEmailVerified = async (email: string) => {
  const user = await dbGetUser(email);

  return !user || Boolean(user.email_verified);
};
