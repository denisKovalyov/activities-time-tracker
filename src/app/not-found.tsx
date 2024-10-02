'use client';

import Error from 'next/error';
import { CloudX } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center [&>div]:!h-auto text-primary">
      <CloudX className="w-28 h-auto" weight="duotone" />
      <Error statusCode={404} />
    </div>
  );
}
