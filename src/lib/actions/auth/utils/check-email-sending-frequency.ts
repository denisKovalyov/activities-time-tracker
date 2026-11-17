import {
  emailSentCache,
  CLEAN_UP_INTERVAL,
} from '@/lib/actions/email/email-cache';
import { EmailRateLimit } from '@/lib/errors';

const EMAIL_RATE_LIMIT_MESSAGE =
  'Seems like an email has already been sent. Please wait a few minutes and try again.';

type EmailType = 'verification' | 'password-reset';

// Limits each type separately, so a verification email doesn't block a password reset
export const checkEmailSendingFrequency = (email: string, type: EmailType) => {
  const key = `${type}:${email}`;
  const sentAt = emailSentCache[key];

  if (sentAt && Date.now() - Number(sentAt) < CLEAN_UP_INTERVAL) {
    console.error(`EMAIL RATE LIMIT BREACH: ${key}`);
    throw new EmailRateLimit(EMAIL_RATE_LIMIT_MESSAGE);
  }

  emailSentCache[key] = Date.now();
};
