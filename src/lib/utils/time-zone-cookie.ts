import { USER_TIME_ZONE_COOKIE_NAME } from '@/lib/constants';
import { getCookies } from '@/lib/utils/common';

// The server needs the user's time zone to know when "today" starts
export const getBrowserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

// Returns true if the cookie was missing or outdated. Time zone names are
// valid cookie values, so they aren't encoded.
export const syncTimeZoneCookie = () => {
  const timeZone = getBrowserTimeZone();
  if (getCookies()[USER_TIME_ZONE_COOKIE_NAME] === timeZone) return false;

  document.cookie = `${USER_TIME_ZONE_COOKIE_NAME}=${timeZone}; path=/; max-age=31536000; secure; SameSite=Lax`;
  return true;
};
