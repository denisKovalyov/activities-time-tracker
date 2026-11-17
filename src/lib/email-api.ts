import { ReactElement } from 'react';
import { render } from '@react-email/render';

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

// https://developers.brevo.com/reference/sendtransacemail
const brevoProvider: EmailProvider = {
  sendEmail: async ({ email, subject, body }) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY ?? '',
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_TITLE, email: emailSendFrom },
        to: [{ email }],
        subject: `${FROM_TITLE}: ${subject}`,
        htmlContent: await render(body),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to send email:', data);
      throw new Error(data.message ?? 'Failed to send email');
    }

    return data;
  },
};

const providers = {
  console: consoleProvider,
  brevo: brevoProvider,
};

const providerName =
  process.env.EMAIL_PROVIDER ||
  (process.env.NODE_ENV === 'production' ? 'brevo' : 'console');

export const emailApiProvider: EmailProvider =
  providers[providerName as keyof typeof providers] ?? brevoProvider;
