'use client';

import { useEffect, useState } from 'react';

import { useRouter } from '@/ui/hooks/use-router';
import { type Day, toDay } from '@/lib/utils/day';
import {
  getBrowserTimeZone,
  syncTimeZoneCookie,
} from '@/lib/utils/time-zone-cookie';

// Focus and visibilitychange often fire together
const MIN_REFRESH_INTERVAL = 1000;
// Changes on other devices while this tab stays focused show up this late
const POLLING_INTERVAL = 60 * 1000;

const msUntilMidnight = () => {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - Date.now();
};

// Keeps the data on the page in line with the database and the user's day.
// It re-renders the page with fresh data from the server (router.refresh):
// - when the tab gets focus or the connection comes back, and every minute
//   while the tab is visible, so changes made in other tabs or on other
//   devices show up;
// - when the user's day or time zone is not the one the server rendered the
//   data for, e.g. at midnight. The time zone is sent in a cookie.
export const KeepDataFresh = ({
  day: renderedDay,
  timeZone: renderedTimeZone,
}: {
  // The day and time zone the server rendered the data for
  day: Day;
  timeZone: string;
}) => {
  const { router } = useRouter();
  // The layout isn't re-mounted by router.refresh(), so the values from the
  // first render are the starting point and are tracked in the effect.
  const [rendered] = useState({ day: renderedDay, timeZone: renderedTimeZone });

  useEffect(() => {
    let { day, timeZone } = rendered;
    let lastRefresh = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      lastRefresh = Date.now();
      router.refresh();
    };

    // `refreshAnyway` refreshes even if the day and time zone didn't change.
    // Such refreshes are throttled, except when the connection comes back:
    // a refresh tried a moment earlier may have failed while offline.
    const check = ({ refreshAnyway = false, throttle = true } = {}) => {
      syncTimeZoneCookie();
      const currentTimeZone = getBrowserTimeZone();
      const today = toDay(new Date(), currentTimeZone);

      if (today !== day || currentTimeZone !== timeZone) {
        day = today;
        timeZone = currentTimeZone;
        refresh();
      } else if (
        refreshAnyway &&
        (!throttle || Date.now() - lastRefresh > MIN_REFRESH_INTERVAL)
      ) {
        refresh();
      }

      // A hidden tab may delay the timeout, so the day is also checked when
      // the tab is shown again.
      clearTimeout(timeoutId);
      timeoutId = setTimeout(check, msUntilMidnight());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible')
        check({ refreshAnyway: true });
    };
    const handleFocus = () => check({ refreshAnyway: true });
    const handleOnline = () => check({ refreshAnyway: true, throttle: false });

    check();
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        check({ refreshAnyway: true });
      }
    }, POLLING_INTERVAL);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [router, rendered]);

  return null;
};
