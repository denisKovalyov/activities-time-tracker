'use server';

import { sendVerificationEmail } from '@/lib/actions/auth/utils/send-verification-email';
import {
  EMAIL_VERIFICATION_RESEND_COOLDOWN_MS,
  EMAIL_VERIFICATION_TTL_MS,
  generateToken,
  hashToken,
} from '@/lib/actions/auth/utils/generate-token';
import {
  getUser,
  replaceEmailVerificationToken,
  verifyEmail as verifyUserEmail,
} from '@/lib/db/users';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export async function resendVerificationEmail(email: string) {
  try {
    const { token, tokenHash, expiresAt } = generateToken(
      EMAIL_VERIFICATION_TTL_MS,
    );

    const isTokenReplaced = await replaceEmailVerificationToken(
      email,
      tokenHash,
      expiresAt,
      EMAIL_VERIFICATION_RESEND_COOLDOWN_MS,
    );

    if (isTokenReplaced) await sendVerificationEmail(email, token);
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  return {
    success: true,
    message:
      'If this email is awaiting verification, a link has been sent. You can request a new one every few minutes.',
  };
}

export async function verifyEmail(email: string | null, token: string | null) {
  try {
    if (!email || !token) {
      return { message: 'Missing required fields' };
    }

    const isVerified =
      (await verifyUserEmail(email, hashToken(token))) ||
      Boolean((await getUser(email))?.email_verified);

    if (!isVerified) {
      return { message: 'The link is invalid or has expired.' };
    }

    return {
      success: true,
      message: 'Email verified successfully. Please re-login.',
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }
}
