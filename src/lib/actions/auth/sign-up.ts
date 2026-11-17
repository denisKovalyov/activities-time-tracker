'use server';

import { redirect } from 'next/navigation';

import { Credentials } from '@/lib/definitions';
import { SignUpSchema } from '@/lib/validation';
import { createUser, getUser } from '@/lib/db/users';
import { sendVerificationEmail } from '@/lib/actions/auth/utils/send-verification-email';
import { checkEmailSendingFrequency } from '@/lib/actions/auth/utils/check-email-sending-frequency';
import {
  EMAIL_VERIFICATION_TTL_MS,
  generateToken,
} from '@/lib/actions/auth/utils/generate-token';
import { hashPassword } from '@/lib/actions/auth/utils/hash-password';
import { EmailRateLimit } from '@/lib/errors';
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

    checkEmailSendingFrequency(email, 'verification');

    const hashedPassword = await hashPassword(password);
    const { token, tokenHash, expiresAt } = generateToken(
      EMAIL_VERIFICATION_TTL_MS,
    );

    await Promise.all([
      sendVerificationEmail(email, token),
      createUser({
        email: email,
        password: hashedPassword,
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: expiresAt,
      }),
    ]);
  } catch (error: unknown) {
    return {
      message:
        error instanceof EmailRateLimit ? error.message : DEFAULT_ERROR_MESSAGE,
    };
  }

  // Redirecting to the email verification page
  redirect(
    `/email/verify/send?email=${encodeURIComponent(email)}&verification_sent=1`,
  );
}
