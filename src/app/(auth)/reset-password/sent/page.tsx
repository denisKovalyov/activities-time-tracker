import { Suspense } from 'react';
import { PasswordResetEmailSent } from '@/ui/auth/password-reset/password-reset-email-sent';

export default function ResetPasswordSendEmail() {
  return (
    <Suspense>
      <PasswordResetEmailSent />
    </Suspense>
  );
}
