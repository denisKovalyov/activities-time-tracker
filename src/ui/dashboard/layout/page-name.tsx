'use client';

import { usePathname } from 'next/navigation';

const PATH_NAME_MAP = {
  '/dashboard': 'Activities',
  '/dashboard/statistics': 'Statistics',
  '/dashboard/settings': 'Settings',
};

export const PageName = () => {
  const pathname = usePathname();

  return <h1>{PATH_NAME_MAP[pathname as keyof typeof PATH_NAME_MAP]}</h1>;
};
