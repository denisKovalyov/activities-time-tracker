import { Suspense } from 'react';
import { ResetPasswordForm } from '@/ui/auth/password-reset/reset-password-form';

export default function ResetPasswordSendEmail() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
