import { Resend } from 'resend';
import { ReactElement } from 'react';
import { EmailRateLimit } from '@/errors';
import { initNewStore } from '@/lib/temporary-store';

const FROM_TITLE = 'Activities Time Tracker';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailParameters = {
  email: string;
  subject: string;
  body: ReactElement;
};

export async function sendEmail({ email, subject, body }: SendEmailParameters) {
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
