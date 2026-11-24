'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { verifyEmail } from '@/lib/actions/auth/email-verification';
import { cn } from '@/lib/utils/common';
import { buttonVariants } from '@/ui/common/button';
import { Logo } from '@/ui/common/logo';
import { Skeleton } from '@/ui/common/skeleton';

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPageLoading) return;
    const verify = async () => {
      const result = await verifyEmail(email, token);
      setIsPageLoading(false);

      if (result.success) {
        setSuccess(result.message);
        return;
      }

      setError(result.message);
    };

    void verify();
  }, [email, token, isPageLoading]);

  if (isPageLoading) {
    return <Skeleton className="h-52 w-80 rounded-md" />;
  }

  return (
    <div className="w-80 rounded-md bg-white p-6 text-center text-secondary">
      <div className="mb-4 flex h-14 justify-center">
        <Logo />
      </div>

      {error && <div className="prose-sm text-destructive">{error}</div>}

      {success && <div className="prose-sm">{success}</div>}

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
