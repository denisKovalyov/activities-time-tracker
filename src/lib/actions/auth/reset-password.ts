'use server';

import { redirect } from 'next/navigation';

import { User } from '@/lib/definitions';
import { EmailRateLimit } from '@/lib/errors';
import { ResetPasswordTemplate } from '@/ui/email-templates/reset-password';
import { setDelay } from '@/lib/utils';
import { getUser, updateUser } from '@/lib/data';
import { sendEmail } from '@/lib/actions/email/send-email';
import { checkEmailSendingFrequency } from '@/lib/actions/auth/utils/check-email-sending-frequency';
import { generateEmailVerificationToken } from '@/lib/actions/auth/utils/generate-email-verification-token';
import { hashPassword } from '@/lib/actions/auth/utils/hash-password';

const SENDING_RESET_LINK_MS = 1000;

const sendResetPasswordEmail = (email: string, token: string) => {
  return sendEmail({
    email,
    subject: 'Reset Password',
    body: ResetPasswordTemplate({ email, token }),
  });
};

export async function sendResetPasswordLink(email: string) {
  const executionStart = Date.now();
  const successLink = `/reset-password/sent?email=${email}`;

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
        error instanceof EmailRateLimit
          ? error.message
          : 'Something went wrong.',
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
  const notFoundLink = '/reset-password/request?not-found-link=true';

  if (!email || !token) return redirect(notFoundLink);
  let user: User | undefined;

  try {
    user = await getUser(email);
  } catch (e) {
    return { message: 'Something went wrong.' };
  }

  if (!user || user.email_verification_token !== token) {
    return redirect(notFoundLink);
  }

  return { success: true };
}

export async function saveNewPassword(email: string, password: string) {
  try {
    await updateUser(email, {
      password: await hashPassword(password),
      email_verification_token: null,
    });
  } catch (e) {
    return { message: 'Something went wrong. Password was not saved.' };
  }

  return { success: true };
}
