import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import type { Credentials, User } from '@/lib/definitions';
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
        return passwordsMatch ? toSessionUser(user) : null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      async profile({ email }) {
        let user = await dbGetUser(email);

        if (!user) {
          user = await dbCreateUser({
            email,
            password: '',
          });
        }

        return toSessionUser(user);
      },
    }),
  ],
  callbacks: authConfig.callbacks,
});
