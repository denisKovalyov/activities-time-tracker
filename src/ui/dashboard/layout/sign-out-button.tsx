'use client';

import { ReactNode } from 'react';
import { signOut } from '@/lib/actions/auth/sign-out';

export const SignOutButton = ({ children, className }: { children: ReactNode, className: string }) => (
  <button
    onClick={() => signOut()}
    className={className}
  >
    {children}
  </button>
);
