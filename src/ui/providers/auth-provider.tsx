'use client';

import { SessionProvider, type SessionProviderProps } from 'next-auth/react';

export function AuthProvider({ children }: SessionProviderProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
