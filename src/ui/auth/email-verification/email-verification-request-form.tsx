'use client';

import { useFormState } from 'react-dom';
import { useSearchParams } from 'next/navigation';

import { resendVerificationEmail } from '@/lib/actions/auth/email-verification';
import { ResendButton } from './resend-button';
import { Logo } from '@/ui/common/logo';
import { FormErrorMessage } from '@/ui/common/form/form';

const DEFAULT_MESSAGE = 'A verification link has been sent to your email.';

export function EmailVerificationRequestForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const verificationSent = Boolean(searchParams.get('verification_sent'));

  const [formState, action] = useFormState(
    resendVerificationEmail.bind(null, decodeURIComponent(email!)),
    undefined,
  );

  const errorMessage = !formState?.success && formState?.message;
  const successMessage = formState?.success && formState?.message;

  return (
    <div className="w-80 p-6 rounded-md bg-white text-secondary text-center relative">
      <div className="h-14 flex justify-center mb-2">
        <Logo/>
      </div>

      <h2 className="prose-lg text-primary mb-4">Please verify your email first</h2>

      {errorMessage && (
        <FormErrorMessage>{errorMessage}</FormErrorMessage>
      )}

      {successMessage && (
        <div className="prose-sm">{successMessage}</div>
      )}

      {verificationSent && !errorMessage && !successMessage && (
        <div className="prose-sm">{DEFAULT_MESSAGE}</div>
      )}

      <form action={action} className="mt-4">
        <ResendButton />
      </form>
    </div>
  );
}
