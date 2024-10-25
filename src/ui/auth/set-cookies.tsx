'use client';

import { useEffect } from 'react';

import { USER_DATE_COOKIE_NAME } from '@/ui/constants';
import { formatDate } from '@/lib/utils';

export const SetCookies = () => {
  useEffect(() => {
    const date = formatDate(new Date());
    document.cookie = `${USER_DATE_COOKIE_NAME}=${date}; path=/dashboard; secure; SameSite=Lax`;
  }, []);

  return null;
}
