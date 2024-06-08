import { ReactElement } from 'react';
import { emailProvider, emailSendFrom } from './email-provider';

const FROM_TITLE = process.env.APP_NAME;

type SendEmailParameters = {
  email: string;
  subject: string;
  body: ReactElement;
};

export async function sendEmail({ email, subject, body }: SendEmailParameters) {
  const { data, error } = await emailProvider.emails.send({
    from: `"${FROM_TITLE}" <${emailSendFrom}>`,
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
