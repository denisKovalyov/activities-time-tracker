'use client';

import { useFormState } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { resendVerificationEmail } from '@/lib/actions/auth';
import { ResendButton } from './resend-button';

const DEFAULT_MESSAGE = 'A verification link has been sent to your email.';

export function EmailVerificationRequestForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const verificationSent = Boolean(searchParams.get('verification_sent'));

  const [formState, action] = useFormState(
    resendVerificationEmail.bind(null, email!),
    undefined,
  );

  const errorMessage = formState?.error;
  const successMessage = formState?.success && formState?.message;

  return (
    <>
      {errorMessage && (
        <div className="mb-4 text-destructive">{errorMessage}</div>
      )}

      {verificationSent && !errorMessage && (
        <div className="mb-4 text-green-500">
          {successMessage || DEFAULT_MESSAGE}
        </div>
      )}

      <div>
        <form action={action}>
          <ResendButton />
        </form>
      </div>
    </>
  );
}
