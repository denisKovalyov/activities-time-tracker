'use client';

import { useEffect } from 'react';

import { type Day, toDay } from '@/lib/utils/day';
import { getBrowserTimeZone } from '@/lib/utils/time-zone-cookie';
import { useRefresh } from '@/ui/layout/keep-data-fresh/use-refresh';

const msUntilMidnight = () => {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - Date.now();
};

// Refreshes when the user's day or time zone is not the one the server
// rendered the data for: at midnight, or when the server didn't know the time
// zone yet. A timeout delayed in a hidden tab is covered by RefreshWhenVisible.
export const RefreshOnNewDay = ({
  day,
  timeZone,
}: {
  day: Day;
  timeZone: string;
}) => {
  const refresh = useRefresh();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const check = () => {
      const currentTimeZone = getBrowserTimeZone();
      if (
        currentTimeZone !== timeZone ||
        toDay(new Date(), currentTimeZone) !== day
      ) {
        refresh();
      }
      timeoutId = setTimeout(check, msUntilMidnight());
    };

    check();
    return () => clearTimeout(timeoutId);
  }, [day, timeZone, refresh]);

  return null;
};
