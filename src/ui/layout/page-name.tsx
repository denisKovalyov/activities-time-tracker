'use client';

import { usePathname } from 'next/navigation';

const PATH_NAME_MAP = {
  '/dashboard': 'Activities',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
};

export const PageName = () => {
  const pathname = usePathname();

  return <h1>{PATH_NAME_MAP[pathname as keyof typeof PATH_NAME_MAP]}</h1>;
};
