'use client';

import { useEffect } from 'react';

import { useRouter } from '@/ui/hooks/use-router';
import {
  getBrowserTimeZone,
  syncTimeZoneCookie,
} from '@/lib/utils/time-zone-cookie';

const msUntilMidnight = () => {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - Date.now();
};

// Keeps the server's "today" in line with the user's: sends the time zone in
// a cookie and re-renders the page with fresh totals when a new day starts.
export const SetCookies = () => {
  const { router } = useRouter();

  useEffect(() => {
    // The layout isn't re-mounted by router.refresh(), so the day is tracked
    // here and the midnight timeout is scheduled again after every check.
    // The cookie is shared by all tabs, so the time zone this tab's data
    // was loaded with is tracked here too.
    let day = new Date().toDateString();
    let timeZone = getBrowserTimeZone();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const refreshIfOutdated = () => {
      const today = new Date().toDateString();
      const currentTimeZone = getBrowserTimeZone();
      const cookieChanged = syncTimeZoneCookie();
      if (cookieChanged || today !== day || currentTimeZone !== timeZone) {
        day = today;
        timeZone = currentTimeZone;
        router.refresh();
      }

      // A hidden tab may delay the timeout, so the day is also checked when
      // the tab is shown again.
      clearTimeout(timeoutId);
      timeoutId = setTimeout(refreshIfOutdated, msUntilMidnight());
    };

    refreshIfOutdated();
    document.addEventListener('visibilitychange', refreshIfOutdated);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', refreshIfOutdated);
    };
  }, [router]);

  return null;
};
