'use server';

import { sendVerificationEmail } from '@/lib/actions/auth/utils/email-send';
import {
  EMAIL_RESEND_COOLDOWN_MS,
  EMAIL_VERIFICATION_TTL_MS,
  generateToken,
  hashToken,
} from '@/lib/actions/auth/utils/generate-token';
import {
  getUser as dbGetUser,
  replaceEmailVerificationToken as dbReplaceEmailVerificationToken,
  verifyEmail as dbVerifyEmail,
} from '@/lib/db/users';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export async function restartEmailVerification(email: string) {
  try {
    const { token, tokenHash, expiresAt } = generateToken(
      EMAIL_VERIFICATION_TTL_MS,
    );

    const isTokenReplaced = await dbReplaceEmailVerificationToken(
      email,
      tokenHash,
      expiresAt,
      EMAIL_RESEND_COOLDOWN_MS,
    );

    if (isTokenReplaced) await sendVerificationEmail(email, token);
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
  try {
    if (!email || !token) {
      return { message: 'Missing required fields' };
    }

    // Verifying first takes one query in the usual case. Only if it fails, the
    // user is checked: the link may have been opened once already. A token
    // exists only for unverified users, so verifying needs no such check.
    const isVerified =
      (await dbVerifyEmail(email, hashToken(token))) ||
      Boolean((await dbGetUser(email))?.email_verified);

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
