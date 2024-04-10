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
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyEmail(email, token)
      .then((message) => {
        setSuccess(message);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => setIsLoading(false));
  }, [email, token]);

  return (
    <div className="w-96 rounded-md bg-white p-6 text-center">
      {isLoading && <div className="mb-4">Please wait...</div>}
      {success && <div className="mb-4 text-green-500">{success}</div>}
      {error && <div className="mb-4 text-destructive">{error}</div>}
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
  );
}
