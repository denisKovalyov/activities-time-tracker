'use client';

import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, update } = useSession();
  console.log('session', session);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Dashboard content
    </main>
  );
}
