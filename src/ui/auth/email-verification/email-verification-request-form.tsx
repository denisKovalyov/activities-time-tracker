'use client';

import { useActionState } from 'react';
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

  const [formState, action] = useActionState(
    resendVerificationEmail.bind(null, decodeURIComponent(email!)),
    undefined,
  );

  const errorMessage = !formState?.success && formState?.message;
  const successMessage = formState?.success && formState?.message;

  return (
    <div className="relative w-80 rounded-md bg-white p-6 text-center text-secondary">
      <div className="mb-2 flex h-14 justify-center">
        <Logo />
      </div>

      <h2 className="prose-lg mb-4 text-primary">
        Please verify your email first
      </h2>

      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}

      {successMessage && <div className="prose-sm">{successMessage}</div>}

      {verificationSent && !errorMessage && !successMessage && (
        <div className="prose-sm">{DEFAULT_MESSAGE}</div>
      )}

      <form action={action} className="mt-4">
        <ResendButton />
      </form>
    </div>
  );
}
