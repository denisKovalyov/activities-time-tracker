import { ReactElement } from 'react';
import { Resend } from 'resend';

const emailProvider = new Resend(process.env.RESEND_API_KEY);
const emailSendFrom = `support@${process.env.APP_DOMAIN_NAME}`;
const FROM_TITLE = process.env.APP_NAME;

export type SendEmailParameters = {
  email: string;
  subject: string;
  body: ReactElement;
};

export const emailApiProvider = {
  sendEmail: async ({ email, subject, body }: SendEmailParameters) => {
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
};

