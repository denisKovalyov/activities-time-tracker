import { Suspense } from 'react';
import { EmailSentMessage } from '@/ui/auth/password-reset/email-sent-message';

export default function ResetPasswordSendEmail() {
  return (
    <Suspense>
      <EmailSentMessage />
    </Suspense>
  );
}
