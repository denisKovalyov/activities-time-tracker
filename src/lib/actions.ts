'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { Credentials } from '@/lib/definitions';
import { LoginSchema } from '@/lib/validation';

export async function authenticate(values: Credentials) {
  const validatedFields = LoginSchema.safeParse({
    email: values.email,
    password: values.password,
  });

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await signIn('credentials', values);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Invalid credentials.' };
        default:
          return { message: 'Something went wrong.' };
      }
    }
    throw error;
  }
}

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
