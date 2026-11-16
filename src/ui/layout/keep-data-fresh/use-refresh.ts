import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { syncTimeZoneCookie } from '@/lib/utils/time-zone-cookie';

// Re-renders the page with fresh data from the server. The server takes the
// user's day from the time zone cookie, so the cookie is updated first.
export const useRefresh = () => {
  const router = useRouter();

  return useCallback(() => {
    syncTimeZoneCookie();
    router.refresh();
  }, [router]);
};
