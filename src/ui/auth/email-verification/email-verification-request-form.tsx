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
    <div className="w-96 rounded-md bg-white p-6 text-center">
      <div className="prose-base mb-4">Please verify your email first</div>

      {errorMessage && (
        <div className="mb-4 text-destructive">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="mb-4 text-green-500">{successMessage}</div>
      )}

      {verificationSent && !errorMessage && !successMessage && (
        <div className="mb-4 text-green-500">{DEFAULT_MESSAGE}</div>
      )}

      <form action={action}>
        <ResendButton />
      </form>
    </div>
  );
}
