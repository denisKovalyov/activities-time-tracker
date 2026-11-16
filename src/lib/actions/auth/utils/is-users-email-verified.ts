import 'server-only';

import { getUser } from '@/lib/db/users';
import { EmailNotVerifiedError } from '@/lib/errors';

// Not a server action: it would tell anyone which emails are registered
export const isUsersEmailVerified = async (email: string) => {
  const user = await getUser(email);

  if (!user) return true;
  if (!user?.email_verified)
    throw new EmailNotVerifiedError(`EMAIL_NOT_VERIFIED: ${email}`);

  return true;
};
