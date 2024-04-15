'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Credentials } from '@/lib/definitions';
import { SignInSchema, SignUpSchema } from '@/lib/validation';
import { EmailNotVerifiedError, EmailRateLimit } from '@/errors';
import { EmailVerificationTemplate } from '@/ui/email-templates/email-verification';
import { ResetPasswordTemplate } from '@/ui/email-templates/reset-password';
import { setDelay } from '@/lib/utils';
import { createUser, getUser, updateUser } from '../data';
import { sendEmail } from './email';

const SENDING_RESET_LINK_MS = 1000;

const generateEmailVerificationToken = () => {
  return randomBytes(32).toString('hex');
};

const sendVerificationEmail = (email: string, token: string) => {
  return sendEmail({
    email,
    subject: 'Email Verification',
    body: EmailVerificationTemplate({ email, token }),
  });
};

const sendResetPasswordEmail = (email: string, token: string) => {
  return sendEmail({
    email,
    subject: 'Reset Password',
    body: ResetPasswordTemplate({ email, token }),
  });
};

export const isUsersEmailVerified = async (email: string) => {
  const user = await getUser(email);

  if (!user) return true;
  if (!user?.email_verified)
    throw new EmailNotVerifiedError(`EMAIL_NOT_VERIFIED: ${email}`);

  return true;
};

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
    if (error instanceof EmailNotVerifiedError) {
      redirect(`/email/verify/send?email=${values.email}`);
    }

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

export async function signUp({ email, password }: Credentials) {
  const validatedFields = SignUpSchema.safeParse({
    email: email,
    password: password,
  });

  // If form validation fails, return field errors early.
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const isEmailExists = await getUser(email);

  if (isEmailExists)
    return {
      errors: {
        email: ['Account with this email already exists'],
      },
    };

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = generateEmailVerificationToken();

  try {
    // First we need to try to send email, to prevent storing invalid tokens in db in case it fails
    await sendVerificationEmail(email, emailVerificationToken);
    await createUser({
      email: email,
      password: hashedPassword,
      emailVerificationToken,
    });
  } catch (error: unknown) {
    return {
      message:
        error instanceof EmailRateLimit
          ? error.message
          : 'Something went wrong.',
    };
  }

  // Redirecting to the email verification page
  redirect(`/email/verify/send?email=${email}&verification_sent=1`);
}

export async function resendVerificationEmail(email: string) {
  try {
    const emailVerificationToken = generateEmailVerificationToken();

    // First we need to try to send email, to prevent storing invalid tokens in db in case it fails
    await sendVerificationEmail(email, emailVerificationToken);
    await updateUser(email, {
      email_verification_token: emailVerificationToken,
    });
  } catch (error) {
    return {
      message:
        error instanceof EmailRateLimit
          ? error.message
          : 'Something went wrong.',
    };
  }

  return {
    success: true,
    message: 'Email verification successfully sent.',
  };
}

export async function verifyEmail(email: string | null, token: string | null) {
  try {
    if (!email || !token) {
      throw new Error('Missing required fields');
    }

    const user = await getUser(email);

    if (user?.email_verified) {
      return 'Email already verified. Please, re-login.';
    }

    if (!user || token !== user.email_verification_token) {
      throw new Error('Invalid verification token');
    }

    await updateUser(email, {
      email_verified: new Date(),
      email_verification_token: null,
    });

    return 'Email verified successfully. Please re-login.';
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
}

export async function sendResetPasswordLink(email: string) {
  const executionStart = Date.now();
  const successLink = `/reset-password/sent?email=${email}`;
  const user = await getUser(email);

  // In case there is no user with entered email we should not show error to improve the level of security
  if (!user) {
    const delay = SENDING_RESET_LINK_MS - (Date.now() - executionStart);
    await setDelay(delay);
    return redirect(successLink);
  }

  try {
    const emailVerificationToken = generateEmailVerificationToken();

    // First we need to try to send email, to prevent storing invalid tokens in db in case it fails
    await sendResetPasswordEmail(email, emailVerificationToken);
    await updateUser(email, {
      email_verification_token: emailVerificationToken,
    });
  } catch (error) {
    return {
      message:
        error instanceof EmailRateLimit
          ? error.message
          : 'Something went wrong.',
    };
  }

  const delay = SENDING_RESET_LINK_MS - (Date.now() - executionStart);
  if (delay >= 50) await setDelay(delay);
  redirect(successLink);
}
