import 'server-only';

import { getAppUrl } from '@/lib/actions/auth/utils/get-app-url';
import { sendEmail } from '@/lib/actions/email/send-email';
import { EmailVerificationTemplate } from '@/ui/email-templates/email-verification';

// Not a server action: it would let anyone send the email to any address
export const sendVerificationEmail = async (email: string, token: string) =>
  sendEmail({
    email,
    subject: 'Email Verification',
    body: EmailVerificationTemplate({ email, token, origin: getAppUrl() }),
  });
