'use client';

import { useEffect } from 'react';

import { useRefresh } from '@/ui/layout/keep-data-fresh/use-refresh';

// Focus and visibilitychange often fire together
const MIN_REFRESH_INTERVAL = 1000;
const POLLING_INTERVAL = 60 * 1000;

// Shows changes made in other tabs or on other devices: refreshes when the tab
// is shown or focused, when the connection comes back, and every minute while
// the tab is visible.
export const RefreshWhenVisible = () => {
  const refresh = useRefresh();

  useEffect(() => {
    let lastRefresh = 0;

    const refreshNow = () => {
      lastRefresh = Date.now();
      refresh();
    };
    const refreshThrottled = () => {
      if (Date.now() - lastRefresh > MIN_REFRESH_INTERVAL) refreshNow();
    };
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') refreshThrottled();
    };

    const intervalId = setInterval(refreshIfVisible, POLLING_INTERVAL);
    document.addEventListener('visibilitychange', refreshIfVisible);
    window.addEventListener('focus', refreshThrottled);
    // Not throttled: a refresh a moment earlier may have failed while offline
    window.addEventListener('online', refreshNow);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      window.removeEventListener('focus', refreshThrottled);
      window.removeEventListener('online', refreshNow);
    };
  }, [refresh]);

  return null;
};
