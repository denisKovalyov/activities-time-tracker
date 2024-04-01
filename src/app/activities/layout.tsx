import { ReactNode } from 'react';
import { signOut } from '@/auth';
import { Button } from '@/ui/common/button';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <form
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <Button variant="outline">Log Out</Button>
      </form>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}
