'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

import { Credentials } from '@/lib/definitions';
import { SignInSchema } from '@/lib/validation';
import { isUsersEmailVerified } from '@/lib/actions/auth/utils/is-users-email-verified';
import { signIn } from '@/auth';
import { PROTECTED_PAGES } from '@/auth.config';
import {
  DEFAULT_ERROR_MESSAGE,
  NEXT_REDIRECT_ERROR,
} from '@/lib/actions/constants';

export async function googleAuthenticate() {
  try {
    await signIn('google');
  } catch (error) {
    if (error instanceof AuthError) {
      return 'Google log is failed.';
    }
    throw error;
  }
}

export async function authenticate(values: Credentials) {
  const validatedFields = SignInSchema.safeParse({
    email: values.email,
    password: values.password,
  });

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  let isEmailVerified = false;

  try {
    isEmailVerified = await isUsersEmailVerified(values.email);
    if (isEmailVerified) await signIn('credentials', values);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid credentials.' };
        default:
          return { message: DEFAULT_ERROR_MESSAGE };
      }
    }

    if ((error as Error).message !== NEXT_REDIRECT_ERROR) {
      console.error(error);
      return { message: DEFAULT_ERROR_MESSAGE };
    }
  }

  if (isEmailVerified) {
    redirect(PROTECTED_PAGES[0]);
  } else {
    redirect(`/email/verify/send?email=${encodeURIComponent(values.email)}`);
  }
}
