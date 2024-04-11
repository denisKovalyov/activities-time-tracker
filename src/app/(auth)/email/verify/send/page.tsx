import { Suspense } from 'react';
import { EmailVerificationRequestForm } from '@/ui/auth/email-verification/email-verification-request-form';

export default function Send() {
  return (
    <Suspense>
      <EmailVerificationRequestForm />
    </Suspense>
  );
}
