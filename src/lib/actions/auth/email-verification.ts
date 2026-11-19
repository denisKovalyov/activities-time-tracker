'use server';

import { sendVerificationEmail } from '@/lib/actions/auth/utils/email-send';
import {
  EMAIL_RESEND_COOLDOWN_MS,
  EMAIL_VERIFICATION_TTL_MS,
  generateToken,
  hashToken,
} from '@/lib/actions/auth/utils/generate-token';
import {
  dbGetUser,
  dbReplaceEmailVerificationToken,
  dbVerifyEmail,
} from '@/lib/db/users';
import { EmailSchema, VerifyEmailSchema } from '@/lib/validation';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

const INVALID_LINK_MESSAGE = 'The link is invalid or has expired.';

export async function restartEmailVerification(email: string) {
  const validatedFields = EmailSchema.safeParse({ email });
  if (!validatedFields.success) return { message: 'Invalid data.' };

  try {
    const { token, tokenHash, expiresAt } = generateToken(
      EMAIL_VERIFICATION_TTL_MS,
    );

    const isTokenReplaced = await dbReplaceEmailVerificationToken(
      validatedFields.data.email,
      tokenHash,
      expiresAt,
      EMAIL_RESEND_COOLDOWN_MS,
    );

    if (isTokenReplaced) {
      await sendVerificationEmail(validatedFields.data.email, token);
    }
  } catch (error) {
    console.error('Error restarting email verification:', error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  return {
    success: true,
    message: 'Email verification successfully sent.',
  };
}

export async function verifyEmail(email: string | null, token: string | null) {
  const validatedFields = VerifyEmailSchema.safeParse({ email, token });
  if (!validatedFields.success) return { message: INVALID_LINK_MESSAGE };

  try {
    const { email: validEmail, token: validToken } = validatedFields.data;

    // Usually one query is enough. If it fails, the link may have been opened
    // before, so check whether the email is already verified.
    const isVerified =
      (await dbVerifyEmail(validEmail, hashToken(validToken))) ||
      Boolean((await dbGetUser(validEmail))?.email_verified);

    if (!isVerified) return { message: INVALID_LINK_MESSAGE };

    return {
      success: true,
      message: 'Email verified successfully. Please re-login.',
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }
}
