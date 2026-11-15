import { cookies } from 'next/headers';

import { USER_TIME_ZONE_COOKIE_NAME } from '@/lib/constants';
import { isValidTimeZone } from '@/lib/utils/day';

// Until the browser sets the cookie (right after the first page load), the
// server falls back to UTC.
export const getUserTimeZone = async () => {
  const cookiesStore = await cookies();
  const timeZone = cookiesStore.get(USER_TIME_ZONE_COOKIE_NAME)?.value ?? '';

  return isValidTimeZone(timeZone) ? timeZone : 'UTC';
};
