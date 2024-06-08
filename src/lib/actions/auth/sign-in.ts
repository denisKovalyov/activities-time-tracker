'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

import { EmailNotVerifiedError } from '@/lib/errors';
import { Credentials } from '@/lib/definitions';
import { SignInSchema } from '@/lib/validation';
import { isUsersEmailVerified } from '@/lib/actions/auth/email-verification';
import { signIn } from '@/auth';

export async function googleAuthenticate(
  prevState: string | undefined,
  formData: FormData,
) {
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

  try {
    await isUsersEmailVerified(values.email);
    await signIn('credentials', values);
  } catch (error) {
    console.error(error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid credentials.' };
        default:
          return { message: 'Something went wrong.' };
      }
    }

    if (!(error instanceof EmailNotVerifiedError)) {
      throw error;
    }
  }

  redirect(`/email/verify/send?email=${values.email}`);
}
