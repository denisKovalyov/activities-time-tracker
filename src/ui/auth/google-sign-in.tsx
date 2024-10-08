import { useFormStatus } from 'react-dom';
import { GoogleLogo } from '@/ui/common/google-logo';
import { Button } from '@/ui/common/button';

export function GoogleSignIn() {
  const { pending } = useFormStatus();

  return (
    <Button
      variant="outline"
      className="w-full dark:text-white"
      loading={pending}
    >
      <GoogleLogo className="mr-2.5" />
      <span>Sign in with Google</span>
    </Button>
  );
}
