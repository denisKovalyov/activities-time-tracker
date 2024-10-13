'use server';

import { sendEmail } from '@/lib/actions/email/send-email';
import { EmailVerificationTemplate } from '@/ui/email-templates/email-verification';
import { checkEmailSendingFrequency } from '@/lib/actions/auth/utils/check-email-sending-frequency';
import { generateEmailVerificationToken } from '@/lib/actions/auth/utils/generate-email-verification-token';
import { getUser, updateUser } from '@/lib/actions/data/user';
import { EmailNotVerifiedError, EmailRateLimit } from '@/lib/errors';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export const sendVerificationEmail = (email: string, token: string) => {
  return sendEmail({
    email,
    subject: 'Email Verification',
    body: EmailVerificationTemplate({ email, token }),
  });
};

export const isUsersEmailVerified = async (email: string) => {
  const user = await getUser(email);

  if (!user) return true;
  if (!user?.email_verified)
    throw new EmailNotVerifiedError(`EMAIL_NOT_VERIFIED: ${email}`);

  return true;
};

export async function resendVerificationEmail(email: string) {
  try {
    checkEmailSendingFrequency(email);
    const emailVerificationToken = generateEmailVerificationToken();

    await Promise.all([
      sendVerificationEmail(email, emailVerificationToken),
      updateUser(email, {
        email_verification_token: emailVerificationToken,
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

    const user = await getUser(email);

    if (user?.email_verified) {
      return {
        success: true,
        message: 'Email already verified. Please, re-login.',
      };
    }

    if (!user || token !== user.email_verification_token) {
      return { message: 'Invalid verification token' };
    }

    await updateUser(email, {
      email_verified: new Date(),
      email_verification_token: null,
    });

    return {
      success: true,
      message: 'Email verified successfully. Please re-login.',
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }
}
