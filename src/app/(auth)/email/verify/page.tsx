import { Suspense } from 'react';
import VerifyEmail from '@/ui/auth/email-verification/verify-email';

export default function Verify() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
