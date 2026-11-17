'use server';

import { sendVerificationEmail } from '@/lib/actions/auth/utils/send-verification-email';
import { checkEmailSendingFrequency } from '@/lib/actions/auth/utils/check-email-sending-frequency';
import {
  EMAIL_VERIFICATION_TTL_MS,
  generateToken,
  hashToken,
} from '@/lib/actions/auth/utils/generate-token';
import {
  getUser,
  updateUser,
  verifyEmail as verifyUserEmail,
} from '@/lib/db/users';
import { EmailRateLimit } from '@/lib/errors';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export async function resendVerificationEmail(email: string) {
  try {
    checkEmailSendingFrequency(email, 'verification');
    const { token, tokenHash, expiresAt } = generateToken(
      EMAIL_VERIFICATION_TTL_MS,
    );

    await Promise.all([
      sendVerificationEmail(email, token),
      updateUser(email, {
        email_verification_token_hash: tokenHash,
        email_verification_expires_at: expiresAt,
      }),
    ]);
  } catch (error) {
    return {
      message:
        error instanceof EmailRateLimit ? error.message : DEFAULT_ERROR_MESSAGE,
    };
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

    // An already verified email gets the same result, so opening the link twice
    // (e.g. React Strict Mode runs the effect twice in development) isn't confusing.
    // The user is read after the update, so a concurrent call that verified it is seen
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
