import { Suspense } from 'react';
import { EmailVerificationRequestForm } from '@/ui/email/email-verification-request-form';

export default function Send() {
  return (
    <Suspense>
      <EmailVerificationRequestForm />
    </Suspense>
  );
}
