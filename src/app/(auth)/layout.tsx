import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      {children}
    </main>
  );
}
