'use server';

import { redirect } from 'next/navigation';

import { ResetPasswordTemplate } from '@/ui/email-templates/reset-password';
import { setDelay } from '@/lib/utils';
import {
  isPasswordResetTokenValid,
  replacePasswordResetToken,
  resetPassword,
} from '@/lib/db/users';
import { ResetPasswordSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/actions/email/send-email';
import {
  EMAIL_RESEND_COOLDOWN_MS,
  PASSWORD_RESET_TTL_MS,
  generateToken,
  hashToken,
} from '@/lib/actions/auth/utils/generate-token';
import { getAppUrl } from '@/lib/actions/auth/utils/get-app-url';
import { hashPassword } from '@/lib/actions/auth/utils/hash-password';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

const SENDING_RESET_LINK_MS = 1000;
const NOT_FOUND_LINK = '/reset-password/request?not-found-link=true';
const INVALID_LINK_MESSAGE =
  'The link is invalid, expired or was already used. Please request a new one.';

const sendResetPasswordEmail = async (email: string, token: string) =>
  sendEmail({
    email,
    subject: 'Reset Password',
    body: ResetPasswordTemplate({ email, token, origin: getAppUrl() }),
  });

export async function sendResetPasswordLink(email: string) {
  const executionStart = Date.now();
  const successLink = `/reset-password/sent?email=${encodeURIComponent(email)}`;

  try {
    const { token, tokenHash, expiresAt } = generateToken(
      PASSWORD_RESET_TTL_MS,
    );

    const isTokenReplaced = await replacePasswordResetToken(
      email,
      tokenHash,
      expiresAt,
      EMAIL_RESEND_COOLDOWN_MS,
    );

    if (isTokenReplaced) await sendResetPasswordEmail(email, token);
  } catch (error) {
    console.error(error);

    return { message: DEFAULT_ERROR_MESSAGE };
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
  let isValid: boolean;

  try {
    isValid = await isPasswordResetTokenValid(email, hashToken(token));
  } catch (e) {
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  if (!isValid) return redirect(NOT_FOUND_LINK);
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
      hashToken(validatedFields.data.token),
      await hashPassword(validatedFields.data.password),
    );
    if (!isReset) return { message: INVALID_LINK_MESSAGE };
  } catch (e) {
    return { message: `${DEFAULT_ERROR_MESSAGE} Password was not saved.` };
  }
}
