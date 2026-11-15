'use client';

import { useEffect } from 'react';

import { syncTimeZoneCookie } from '@/lib/utils/time-zone-cookie';

// Sets the time zone cookie before sign-in, so the first dashboard render
// already uses the user's "today".
export const SetCookies = () => {
  useEffect(() => {
    syncTimeZoneCookie();
  }, []);

  return null;
};
