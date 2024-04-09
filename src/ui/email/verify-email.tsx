'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { verifyEmail } from '@/lib/actions/auth';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/ui/common/button';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState('Error verifying your email');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyEmail(email, token)
      .then(() => {
        setResult('Email verified successfully. Please re-login.');
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, [email, token]);

  return (
    <>
      <div className="mb-4">{isLoading ? 'Please wait ...' : result}</div>
      {error && <div className="mb-4 text-destructive">{error}</div>}
      <div className="my-4">
        <Link
          className={cn(
            buttonVariants({
              variant: 'link',
              className: 'h-auto px-0 py-0',
            }),
          )}
          href="/sign-in"
        >
          Back to Login
        </Link>
      </div>
    </>
  );
}
