import { Suspense } from 'react';
import { SendLinkForm } from '@/ui/auth/password-reset/send-link-form';

export default function ResetPasswordSendEmail() {
  return (
    <Suspense>
      <SendLinkForm />
    </Suspense>
  );
}
