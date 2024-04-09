import { Suspense } from 'react';
import { EmailVerificationRequestForm } from '@/ui/email/email-verification-request-form';

export default function Send() {
  return (
    <div className="flex flex-col">
      <div className="mb-4">Please verify your email first.</div>
      <Suspense>
        <EmailVerificationRequestForm />
      </Suspense>
    </div>
  );
}
