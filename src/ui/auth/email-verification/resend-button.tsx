import { useFormStatus } from 'react-dom';
import { Button } from '@/ui/common/button';

export function ResendButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      Resend verification link {pending ? '...' : ''}
    </Button>
  );
}
