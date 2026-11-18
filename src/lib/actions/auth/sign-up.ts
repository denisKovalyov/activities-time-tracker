'use server';

import { redirect } from 'next/navigation';

import { Credentials } from '@/lib/definitions';
import { SignUpSchema } from '@/lib/validation';
import { createUser, getUser } from '@/lib/db/users';
import { sendVerificationEmail } from '@/lib/actions/auth/utils/send-verification-email';
import {
  EMAIL_VERIFICATION_TTL_MS,
  generateToken,
} from '@/lib/actions/auth/utils/generate-token';
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
    const isEmailExists = await getUser(email);

    if (isEmailExists)
      return {
        errors: {
          email: ['Account with this email already exists'],
        },
      };

    const hashedPassword = await hashPassword(password);
    const { token, tokenHash, expiresAt } = generateToken(
      EMAIL_VERIFICATION_TTL_MS,
    );

    await createUser({
      email: email,
      password: hashedPassword,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
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
