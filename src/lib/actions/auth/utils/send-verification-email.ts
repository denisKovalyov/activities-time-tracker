import 'server-only';
import { headers } from 'next/headers';

import { sendEmail } from '@/lib/actions/email/send-email';
import { EmailVerificationTemplate } from '@/ui/email-templates/email-verification';

// Not a server action: it would let anyone send the email to any address
export const sendVerificationEmail = async (email: string, token: string) => {
  const headersList = await headers();
  const origin = headersList.get('origin') || '';

  return sendEmail({
    email,
    subject: 'Email Verification',
    body: EmailVerificationTemplate({ email, token, origin }),
  });
};
