import bcrypt from 'bcrypt';
import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import type { Credentials, User } from '@/lib/types';
import { authConfig } from './auth.config';
import { dbGetUser, dbCreateUser } from '@/lib/db/users';

// The user goes to the JWT and the session, which the client can read, so
// the password and token hashes must stay out
const toSessionUser = ({
  id,
  name,
  email,
  email_verified,
  created_at,
}: User) => ({ id, name, email, email_verified, created_at });

export const EMAIL_NOT_VERIFIED = 'email_not_verified';

// Thrown only after the password matched, so only the owner learns that the
// email still needs verification
class EmailNotVerifiedError extends CredentialsSignin {
  code = EMAIL_NOT_VERIFIED;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { email, password } = credentials as Credentials;
        const user = await dbGetUser(email);

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;
        if (!user.email_verified) throw new EmailNotVerifiedError();

        return toSessionUser(user);
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      async profile({ email, email_verified }) {
        let user = await dbGetUser(email);

        // An existing unverified account stays unverified: its password may
        // have been set by someone else
        if (!user) {
          user = await dbCreateUser({
            email,
            password: '',
            emailVerified: email_verified ? new Date() : null,
          });
        }

        return toSessionUser(user);
      },
    }),
  ],
  callbacks: authConfig.callbacks,
});
