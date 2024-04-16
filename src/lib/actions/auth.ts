'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Credentials, User } from '@/lib/definitions';
import { SignInSchema, SignUpSchema } from '@/lib/validation';
import { EmailNotVerifiedError, EmailRateLimit } from '@/errors';
import { EmailVerificationTemplate } from '@/ui/email-templates/email-verification';
import { ResetPasswordTemplate } from '@/ui/email-templates/reset-password';
import { initNewStore } from '@/lib/temporary-store';
import { setDelay } from '@/lib/utils';
import { createUser, getUser, updateUser } from '../data';
import { sendEmail } from './email';

const SENDING_RESET_LINK_MS = 1000;
const FIVE_MINUTES_IN_MS = 1000 * 60 * 5;
const EMAIL_RATE_LIMIT_MESSAGE =
  'Seems like an email has already been sent. Please wait a few minutes and try again.';

const emailSentCache = initNewStore(
  FIVE_MINUTES_IN_MS,
  (_, timestamp) => Date.now() - +timestamp >= FIVE_MINUTES_IN_MS,
);

const generateEmailVerificationToken = () => {
  return randomBytes(32).toString('hex');
};

const checkEmailSendingFrequency = (email: string) => {
  if (email in emailSentCache) {
    if (Date.now() - Number(emailSentCache[email]) < FIVE_MINUTES_IN_MS) {
      console.error(`EMAIL RATE LIMIT BREACH: ${email}`);
      throw new EmailRateLimit(EMAIL_RATE_LIMIT_MESSAGE);
    }
  } else {
    emailSentCache[email] = Date.now();
  }
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

  return redirect(`/email/verify/send?email=${values.email}`);
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

  try {
    const isEmailExists = await getUser(email);

    if (isEmailExists)
      return {
        errors: {
          email: ['Account with this email already exists'],
        },
      };

    checkEmailSendingFrequency(email);

    const hashedPassword = await bcrypt.hash(password, 10);
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
          : 'Something went wrong.',
    };
  }

  // Redirecting to the email verification page
  redirect(`/email/verify/send?email=${email}&verification_sent=1`);
}

export async function resendVerificationEmail(email: string) {
  try {
    checkEmailSendingFrequency(email);
    const emailVerificationToken = generateEmailVerificationToken();

    await Promise.all([
      sendVerificationEmail(email, emailVerificationToken),
      updateUser(email, {
        email_verification_token: emailVerificationToken,
      }),
    ]);
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

  try {
    checkEmailSendingFrequency(email);
    const user = await getUser(email);

    if (user) {
      const emailVerificationToken = generateEmailVerificationToken();

      await Promise.all([
        sendResetPasswordEmail(email, emailVerificationToken),
        updateUser(email, {
          email_verification_token: emailVerificationToken,
        }),
      ]);
    }
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

export async function checkResetPasswordLink(
  email: string | null,
  token: string | null,
) {
  const notFoundLink = '/reset-password/request?not-found-link=true';

  if (!email || !token) return redirect(notFoundLink);
  let user: User | undefined;

  try {
    user = await getUser(email);
  } catch (e) {
    return { message: 'Something went wrong.' };
  }

  if (!user || user.email_verification_token !== token) {
    return redirect(notFoundLink);
  }

  return { success: true };
}

export async function saveNewPassword(email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUser(email, {
      password: hashedPassword,
      email_verification_token: null,
    });
  } catch (e) {
    return { message: 'Something went wrong. Password was not saved.' };
  }

  return { success: true };
}
