'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/ui/common/button';

const TITLE = 'Check Your Mailbox!';
const TEXT_SUCCESS = `We've successfully sent a password reset link to the email address associated with your account.
  Please check your inbox for an email from us.`;
const TEXT_WARNING = `If you don't receive the email within the next few minutes,
  please check spam or junk folder or make sure you’ve typed email address used for app account and `;

export function EmailSentMessage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const href = `/reset-password/request?email=${email}`;

  return (
    <div className="w-80 p-6 rounded-md bg-white text-secondary">
      <div className="prose-lg mb-4 text-center text-primary">{TITLE}</div>
      <div className="prose-sm mb-4">{TEXT_SUCCESS}</div>
      <div className="prose-sm mb-4">
        {TEXT_WARNING}
        <Link
          className={cn(
            buttonVariants({
              variant: 'link',
              className: 'h-auto px-0 py-0',
            }),
          )}
          href={href}
        >
          try to resend email again
        </Link>
      </div>
    </div>
  );
}
