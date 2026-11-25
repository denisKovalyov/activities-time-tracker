'use server';

import { redirect } from 'next/navigation';

import { Credentials } from '@/lib/types';
import { SignUpSchema } from '@/lib/validation';
import { dbCreateUser, dbGetUser } from '@/lib/db/users';
import { sendVerificationEmail } from '@/lib/actions/auth/utils/email-send';
import { generateToken } from '@/lib/actions/auth/utils/generate-token';
import { hashPassword } from '@/lib/actions/auth/utils/hash-password';
import { DEFAULT_ERROR_MESSAGE } from '@/lib/actions/constants';

export async function signUp({ email, password }: Credentials) {
  const validatedFields = SignUpSchema.safeParse({
    email: email,
    password: password,
  });

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const isEmailExists = await dbGetUser(email);

    if (isEmailExists)
      return {
        errors: {
          email: ['Account with this email already exists'],
        },
      };

    const hashedPassword = await hashPassword(password);
    const { token, tokenHash } = generateToken();

    await dbCreateUser({
      email: email,
      password: hashedPassword,
      emailVerificationTokenHash: tokenHash,
    });
    await sendVerificationEmail(email, token);
  } catch (error) {
    console.error('Error signing up:', error);
    return { message: DEFAULT_ERROR_MESSAGE };
  }

  // Redirecting to the email verification page
  redirect(
    `/email/verify/send?email=${encodeURIComponent(email)}&verification_sent=1`,
  );
}
