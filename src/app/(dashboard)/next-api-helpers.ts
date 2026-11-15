import { cookies } from 'next/headers';

import {
  USER_DATE_COOKIE_NAME,
  USER_TIME_ZONE_COOKIE_NAME,
} from '@/lib/constants';
import { isValidTimeZone } from '@/lib/utils/day';

export const retrieveDateFromCookies = async () => {
  const cookiesStore = await cookies();
  const { value: dateStr } = cookiesStore.get(USER_DATE_COOKIE_NAME) || {};

  return dateStr ? new Date(dateStr) : new Date();
};

// Until the browser sets the cookie (right after the first page load), the
// server falls back to UTC.
export const getUserTimeZone = async () => {
  const cookiesStore = await cookies();
  const value = cookiesStore.get(USER_TIME_ZONE_COOKIE_NAME)?.value;
  const timeZone = value ? decodeURIComponent(value) : '';

  return isValidTimeZone(timeZone) ? timeZone : 'UTC';
};
