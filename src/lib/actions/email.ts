import { Resend } from 'resend';
import { ReactElement } from 'react';
import { EmailRateLimit } from '@/errors';
import { initNewStore } from '@/lib/temporary-store';

const FROM_TITLE = 'Activities Time Tracker';
const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
const EMAIL_RATE_LIMIT_MESSAGE =
  'Seems like an email has already been sent. Please wait a few minutes and try again.';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSentCache = initNewStore(
  FIVE_MINUTES_IN_MS,
  (_, timestamp) => Date.now() - +timestamp >= FIVE_MINUTES_IN_MS,
);

type SendEmailParameters = {
  email: string;
  subject: string;
  body: ReactElement;
};

export async function sendEmail({ email, subject, body }: SendEmailParameters) {
  if (email in emailSentCache) {
    if (Date.now() - Number(emailSentCache[email]) < FIVE_MINUTES_IN_MS) {
      console.error(`EMAIL RATE LIMIT BREACH: ${email}`);
      throw new EmailRateLimit(EMAIL_RATE_LIMIT_MESSAGE);
    }
  } else {
    emailSentCache[email] = Date.now();
  }

  const { data, error } = await resend.emails.send({
    from: `"${FROM_TITLE}" <onboarding@resend.dev>`,
    to: email,
    subject: `${FROM_TITLE}: ${subject}`,
    react: body,
  });

  if (error) {
    console.error('Failed to send email:', error);
    throw error;
  }

  return data;
}
