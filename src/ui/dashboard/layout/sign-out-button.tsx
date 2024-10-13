'use client';

import { ReactNode } from 'react';
import { signOut } from '@/lib/actions/auth/sign-out';
import { useToast } from '@/ui/hooks/use-toast';

export const SignOutButton = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) => {
  const { toast } = useToast();

  const handleSignOut = async () => {
    const result = await signOut();

    if (result?.message) {
      toast({
        title: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <button onClick={handleSignOut} className={className}>
      {children}
    </button>
  );
};
