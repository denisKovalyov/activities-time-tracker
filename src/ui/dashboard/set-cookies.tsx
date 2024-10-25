'use client';

import { useEffect } from 'react';

import { USER_DATE_COOKIE_NAME } from '@/ui/constants';
import { formatDate } from '@/lib/utils';

export const SetCookies = () => {
  useEffect(() => {
    const cookies = document.cookie
      .split('; ')
      .reduce((prev, current) => {
        const [name, ...rest] = current.split('=');
        prev[name] = rest.join('=');
        return prev;
      }, {} as Record<string, string>);

    const date = formatDate(new Date());

    if (!cookies[USER_DATE_COOKIE_NAME] || date !== cookies[USER_DATE_COOKIE_NAME]) {
      document.cookie = `${USER_DATE_COOKIE_NAME}=${date}; path=/dashboard; secure; SameSite=Lax`;
      window.location.reload();
    }
  }, []);

  return null;
}
