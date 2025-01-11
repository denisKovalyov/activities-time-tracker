'use server';

import { signOut as signOutFn } from '@/auth';
import { DEFAULT_ERROR_MESSAGE, NEXT_REDIRECT_ERROR } from '@/lib/actions/constants';

export async function signOut() {
  try {
    await signOutFn();
  } catch (error) {
    if ((error as Error).message === NEXT_REDIRECT_ERROR) {
      throw error;
    }
    console.error(error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }
}
