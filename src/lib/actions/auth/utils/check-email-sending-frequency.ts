import { emailSentCache, CLEAN_UP_INTERVAL } from '@/lib/actions/email/email-cache';
import { EmailRateLimit } from '@/lib/errors';

const EMAIL_RATE_LIMIT_MESSAGE =
  'Seems like an email has already been sent. Please wait a few minutes and try again.';

export const checkEmailSendingFrequency = (email: string) => {
  if (email in emailSentCache) {
    if (Date.now() - Number(emailSentCache[email]) < CLEAN_UP_INTERVAL) {
      console.error(`EMAIL RATE LIMIT BREACH: ${email}`);
      throw new EmailRateLimit(EMAIL_RATE_LIMIT_MESSAGE);
    }
  } else {
    emailSentCache[email] = Date.now();
  }
};
