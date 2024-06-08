'use server';

import { EmailRateLimit } from '@/lib/errors';
import { initNewStore } from '@/lib/temporary-store';

const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
const EMAIL_RATE_LIMIT_MESSAGE =
  'Seems like an email has already been sent. Please wait a few minutes and try again.';

const emailSentCache = initNewStore(
  FIVE_MINUTES_IN_MS,
  (_, timestamp) => Date.now() - +timestamp >= FIVE_MINUTES_IN_MS,
);

export const checkEmailSendingFrequency = (email: string) => {
  if (email in emailSentCache) {
    if (Date.now() - Number(emailSentCache[email]) < FIVE_MINUTES_IN_MS) {
      console.error(`EMAIL RATE LIMIT BREACH: ${email}`);
      throw new EmailRateLimit(EMAIL_RATE_LIMIT_MESSAGE);
    }
  } else {
    emailSentCache[email] = Date.now();
  }
};
