'use client';

import Error from 'next/error';
import { CloudX } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center text-primary [&>div]:!h-auto">
      <CloudX className="h-auto w-28" weight="duotone" />
      <Error statusCode={404} />
    </div>
  );
}
