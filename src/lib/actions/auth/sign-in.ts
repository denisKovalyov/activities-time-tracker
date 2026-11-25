'use server';

import { AuthError, CredentialsSignin } from 'next-auth';
import { redirect, unstable_rethrow } from 'next/navigation';

import { Credentials } from '@/lib/types';
import { SignInSchema } from '@/lib/validation';
import { EMAIL_NOT_VERIFIED, signIn } from '@/auth';
import { PROTECTED_PAGES } from '@/auth.config';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export async function googleAuthenticate() {
  try {
    await signIn('google');
  } catch (error) {
    if (error instanceof AuthError) {
      return 'Google sign-in failed.';
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

  try {
    await signIn('credentials', {
      ...validatedFields.data,
      redirectTo: PROTECTED_PAGES[0],
    });
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof CredentialsSignin) {
      if (error.code === EMAIL_NOT_VERIFIED) {
        redirect(
          `/email/verify/send?email=${encodeURIComponent(values.email)}`,
        );
      }
      return { message: 'Invalid credentials.' };
    }

    if (!(error instanceof AuthError)) console.error(error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }
}
