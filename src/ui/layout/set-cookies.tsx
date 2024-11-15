'use client';

import { useEffect } from 'react';

import { USER_DATE_COOKIE_NAME } from '@/lib/constants';
import { formatDate, getCookies } from '@/lib/utils';

const handleDateCookies = () => {
  const cookies = getCookies();
  const date = formatDate(new Date());

  if (!cookies[USER_DATE_COOKIE_NAME] || date !== cookies[USER_DATE_COOKIE_NAME]) {
    document.cookie = `${USER_DATE_COOKIE_NAME}=${date}; path=/; secure; SameSite=Lax`;
    window.location.reload();
  }
}

export const SetCookies = () => {
  useEffect(() => {
    handleDateCookies();

    document.addEventListener('visibilitychange', handleDateCookies);

    return () => {
      document.removeEventListener('visibilitychange', handleDateCookies);
    };
  }, []);

  return null;
}
