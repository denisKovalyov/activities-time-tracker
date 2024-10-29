import { cookies } from 'next/headers';

import { USER_DATE_COOKIE_NAME } from '@/lib/constants';

export const retrieveDateFromCookies = async () => {
  const cookiesStore = await cookies();
  const { value: dateStr } = cookiesStore.get(USER_DATE_COOKIE_NAME as any) || {};

  return dateStr ? new Date(dateStr) : new Date();
}
