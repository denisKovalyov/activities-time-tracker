'use server';

import { redirect } from 'next/navigation';

import { setDelay } from '@/lib/utils/common';
import {
  dbIsPasswordResetTokenValid,
  dbReplacePasswordResetToken,
  dbResetPassword,
} from '@/lib/db/users';
import { ResetPasswordSchema } from '@/lib/validation';
import { sendResetPasswordEmail } from '@/lib/actions/auth/utils/email-send';
import {
  generateToken,
  hashToken,
} from '@/lib/actions/auth/utils/generate-token';
import { hashPassword } from '@/lib/actions/auth/utils/hash-password';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

// The response takes at least this long whether an email was sent or not, so
// its time doesn't reveal which emails are registered
const MIN_RESPONSE_TIME_MS = 1000;
const NOT_FOUND_LINK = '/reset-password/request?not-found-link=true';
const INVALID_LINK_MESSAGE =
  'The link is invalid, expired or was already used. Please request a new one.';

export async function sendResetPasswordLink(email: string) {
  const startedAt = Date.now();
  const successLink = `/reset-password/sent?email=${encodeURIComponent(email)}`;

  try {
    const { token, tokenHash } = generateToken();

    const isTokenReplaced = await dbReplacePasswordResetToken(email, tokenHash);

    if (isTokenReplaced) await sendResetPasswordEmail(email, token);
  } catch (error) {
    console.error(error);

    return { message: DEFAULT_ERROR_MESSAGE };
  }

  await setDelay(MIN_RESPONSE_TIME_MS - (Date.now() - startedAt));
  redirect(successLink);
}

export async function checkResetPasswordLink(
  email: string | null,
  token: string | null,
) {
  if (!email || !token) return redirect(NOT_FOUND_LINK);
  let isValid: boolean;

  try {
    isValid = await dbIsPasswordResetTokenValid(email, hashToken(token));
  } catch (e) {
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  if (!isValid) return redirect(NOT_FOUND_LINK);
}

// A public endpoint: the token from the link is checked here, not only when
// the page is opened
export async function saveNewPassword(
  email: string | null,
  token: string | null,
  password: string,
) {
  const validatedFields = ResetPasswordSchema.safeParse({
    email,
    token,
    password,
  });
  if (!validatedFields.success) return { message: 'Invalid data.' };

  try {
    const isReset = await dbResetPassword(
      validatedFields.data.email,
      hashToken(validatedFields.data.token),
      await hashPassword(validatedFields.data.password),
    );
    if (!isReset) return { message: INVALID_LINK_MESSAGE };
  } catch (e) {
    return { message: `${DEFAULT_ERROR_MESSAGE} Password was not saved.` };
  }
}
