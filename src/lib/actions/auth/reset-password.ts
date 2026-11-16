'use server';

import { redirect } from 'next/navigation';

import { User } from '@/lib/definitions';
import { EmailRateLimit } from '@/lib/errors';
import { ResetPasswordTemplate } from '@/ui/email-templates/reset-password';
import { setDelay } from '@/lib/utils';
import { getUser, resetPassword, updateUser } from '@/lib/db/users';
import { ResetPasswordSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/actions/email/send-email';
import { checkEmailSendingFrequency } from '@/lib/actions/auth/utils/check-email-sending-frequency';
import { generateEmailVerificationToken } from '@/lib/actions/auth/utils/generate-email-verification-token';
import { hashPassword } from '@/lib/actions/auth/utils/hash-password';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { headers } from 'next/headers';

const SENDING_RESET_LINK_MS = 1000;
const NOT_FOUND_LINK = '/reset-password/request?not-found-link=true';
const INVALID_LINK_MESSAGE =
  'The link is invalid or was already used. Please request a new one.';

const sendResetPasswordEmail = async (email: string, token: string) => {
  const headersList = await headers();
  const origin = headersList.get('origin') || '';

  return sendEmail({
    email,
    subject: 'Reset Password',
    body: ResetPasswordTemplate({ email, token, origin }),
  });
};

export async function sendResetPasswordLink(email: string) {
  const executionStart = Date.now();
  const successLink = `/reset-password/sent?email=${encodeURIComponent(email)}`;

  try {
    checkEmailSendingFrequency(email);
    const user = await getUser(email);

    if (user) {
      const emailVerificationToken = generateEmailVerificationToken();

      await Promise.all([
        sendResetPasswordEmail(email, emailVerificationToken),
        updateUser(email, {
          email_verification_token: emailVerificationToken,
        }),
      ]);
    }
  } catch (error) {
    console.error(error);

    return {
      message:
        error instanceof EmailRateLimit ? error.message : DEFAULT_ERROR_MESSAGE,
    };
  }

  const delay = SENDING_RESET_LINK_MS - (Date.now() - executionStart);
  if (delay >= 50) await setDelay(delay);
  redirect(successLink);
}

export async function checkResetPasswordLink(
  email: string | null,
  token: string | null,
) {
  if (!email || !token) return redirect(NOT_FOUND_LINK);
  let user: User | undefined;

  try {
    user = await getUser(email);
  } catch (e) {
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  if (!user || user.email_verification_token !== token) {
    return redirect(NOT_FOUND_LINK);
  }
}

// A public endpoint: the token from the link is checked here, not only when
// the page is opened
export async function saveNewPassword(
  email: string,
  token: string,
  password: string,
) {
  const validatedFields = ResetPasswordSchema.safeParse({
    email,
    token,
    password,
  });
  if (!validatedFields.success) return { message: 'Invalid data.' };

  try {
    const isReset = await resetPassword(
      validatedFields.data.email,
      validatedFields.data.token,
      await hashPassword(validatedFields.data.password),
    );
    if (!isReset) return { message: INVALID_LINK_MESSAGE };
  } catch (e) {
    return { message: `${DEFAULT_ERROR_MESSAGE} Password was not saved.` };
  }
}
