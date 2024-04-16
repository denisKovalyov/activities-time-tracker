import { Suspense } from 'react';
import { PasswordSaveForm } from '@/ui/auth/password-reset/password-save-form';

export default function ResetPassword() {
  return (
    <Suspense>
      <PasswordSaveForm />
    </Suspense>
  );
}
