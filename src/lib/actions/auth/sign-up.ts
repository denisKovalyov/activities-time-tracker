'use server';

import { redirect } from 'next/navigation';

import { Credentials } from '@/lib/definitions';
import { SignUpSchema } from '@/lib/validation';
import { createUser, getUser } from '@/lib/actions/data/user';
import { sendVerificationEmail } from '@/lib/actions/auth/email-verification';
import { checkEmailSendingFrequency } from '@/lib/actions/auth/utils/check-email-sending-frequency';
import { generateEmailVerificationToken } from '@/lib/actions/auth/utils/generate-email-verification-token';
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

    checkEmailSendingFrequency(email);

    const hashedPassword = await hashPassword(password);
    const emailVerificationToken = generateEmailVerificationToken();

    await Promise.all([
      sendVerificationEmail(email, emailVerificationToken),
      createUser({
        email: email,
        password: hashedPassword,
        emailVerificationToken,
      }),
    ]);
  } catch (error: unknown) {
    return {
      message:
        error instanceof EmailRateLimit
          ? error.message
          : DEFAULT_ERROR_MESSAGE,
    };
  }

  // Redirecting to the email verification page
  redirect(`/email/verify/send?email=${encodeURIComponent(email)}&verification_sent=1`);
}
