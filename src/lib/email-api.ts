import { ReactElement } from 'react';
import { render } from '@react-email/render';
import { Resend } from 'resend';

const emailSendFrom = `support@${process.env.APP_DOMAIN_NAME}`;
const FROM_TITLE = process.env.APP_NAME;

export type SendEmailParameters = {
  email: string;
  subject: string;
  body: ReactElement;
};

type EmailProvider = {
  sendEmail: (params: SendEmailParameters) => Promise<unknown>;
};

// Logs the email instead of sending it, so links can be followed in development
const consoleProvider: EmailProvider = {
  sendEmail: async ({ email, subject, body }) => {
    const text = await render(body, { plainText: true });

    console.info(
      `\n[email] To: ${email}\n[email] Subject: ${FROM_TITLE}: ${subject}\n\n${text}\n`,
    );
  },
};

let resend: Resend | undefined;

const resendProvider: EmailProvider = {
  sendEmail: async ({ email, subject, body }) => {
    resend ??= new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: `"${FROM_TITLE}" <${emailSendFrom}>`,
      to: email,
      subject: `${FROM_TITLE}: ${subject}`,
      html: await render(body),
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw error;
    }

    return data;
  },
};

const providers = {
  console: consoleProvider,
  resend: resendProvider,
};

const providerName =
  process.env.EMAIL_PROVIDER ??
  (process.env.NODE_ENV === 'production' ? 'resend' : 'console');

export const emailApiProvider: EmailProvider =
  providers[providerName as keyof typeof providers] ?? resendProvider;
