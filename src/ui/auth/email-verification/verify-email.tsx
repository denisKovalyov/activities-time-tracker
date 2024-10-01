'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { verifyEmail } from '@/lib/actions/auth/email-verification';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/ui/common/button';
import { Logo } from '@/ui/common/logo';
import { Skeleton } from '@/ui/common/skeleton';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPageLoading) return;

    let emailDecoded = email ? decodeURIComponent(email) : email;

    verifyEmail(emailDecoded, token)
      .then((message) => {
        setSuccess(message);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, [email, token, isPageLoading]);

  if (isPageLoading) {
    return (
      <Skeleton className="w-80 h-52 rounded-md" />
    );
  }

  return (
    <div className="w-80 p-6 rounded-md bg-white text-secondary text-center">
      <div className="h-14 flex justify-center mb-4">
        <Logo/>
      </div>

      {error && (
        <div className="prose-sm text-destructive">{error}</div>
      )}

      {success && (
        <div className="prose-sm">{success}</div>
      )}

      <Link
        className={cn(
          'mt-4',
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
