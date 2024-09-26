import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      {children}
    </main>
  );
}
