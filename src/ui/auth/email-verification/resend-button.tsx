import { useFormStatus } from 'react-dom';
import { Button } from '@/ui/common/button';
import { LoadingOverlay } from '@/ui/common/loading-overlay';

export function ResendButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <LoadingOverlay show={pending} className="rounded-md" />
      <Button type="submit" variant="outline">
        Resend verification link
      </Button>
    </>
  );
}
