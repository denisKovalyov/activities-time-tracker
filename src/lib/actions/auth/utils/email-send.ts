import 'server-only';

import { getAppUrl } from '@/lib/actions/auth/utils/get-app-url';
import { sendEmail } from '@/lib/actions/email/send-email';
import { EmailVerificationTemplate } from '@/ui/email-templates/email-verification';
import { ResetPasswordTemplate } from '@/ui/email-templates/reset-password';

// Not server actions (public endpoints), to prevent sending emails to
// arbitrary addresses

export const sendVerificationEmail = async (email: string, token: string) =>
  sendEmail({
    email,
    subject: 'Email Verification',
    body: EmailVerificationTemplate({ email, token, origin: getAppUrl() }),
  });

export const sendResetPasswordEmail = async (email: string, token: string) =>
  sendEmail({
    email,
    subject: 'Reset Password',
    body: ResetPasswordTemplate({ email, token, origin: getAppUrl() }),
  });
