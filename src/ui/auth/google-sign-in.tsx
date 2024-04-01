import React from 'react';
import { Button } from '@/ui/common/button';
import { useFormStatus } from 'react-dom';

export function GoogleSignIn() {
  const { pending } = useFormStatus();

  return (
    <Button>Google Sign In{pending ? '...' : ''}</Button>
  );
};
