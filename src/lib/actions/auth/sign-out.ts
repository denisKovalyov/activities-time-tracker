'use server';

import { signOut as signOutFn } from '@/auth';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';
import { isRedirectError } from 'next/dist/client/components/redirect';

export async function signOut() {
  try {
    await signOutFn();
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }
}
