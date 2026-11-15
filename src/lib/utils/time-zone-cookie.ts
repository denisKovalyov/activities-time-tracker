import { USER_TIME_ZONE_COOKIE_NAME } from '@/lib/constants';
import { getCookies } from '@/lib/utils/common';

// The server needs the user's time zone to know when "today" starts. It's
// sent in a cookie; this runs in the browser.
export const getBrowserTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

// Returns true if the cookie was missing or outdated.
export const syncTimeZoneCookie = () => {
  const timeZone = getBrowserTimeZone();
  if (
    decodeURIComponent(getCookies()[USER_TIME_ZONE_COOKIE_NAME] ?? '') ===
    timeZone
  ) {
    return false;
  }

  document.cookie = `${USER_TIME_ZONE_COOKIE_NAME}=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; secure; SameSite=Lax`;
  return true;
};
