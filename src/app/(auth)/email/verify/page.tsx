import { Suspense } from 'react';
import VerifyEmail from '@/ui/email/verify-email';

export default function Verify() {
  return (
    <Suspense>
      <div className="flex flex-col">
        <VerifyEmail />
      </div>
    </Suspense>
  );
}
