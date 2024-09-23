'use server';

import { signOut as signOutFn} from '@/auth';

export async function signOut() {
  try {
    await signOutFn();
  } catch (error) {
    throw error;
  }
}
