import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import type { Credentials, User } from '@/lib/definitions';
import { authConfig } from './auth.config';
import { getUser, createUser } from '@/lib/actions/data/user';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update: update,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { email, password } = credentials as Credentials;
        const user = await getUser(email);

        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        return passwordsMatch ? user : null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      async profile({ email, email_verified }) {
        let user = await getUser(email);

        if (!user) {
          user = await createUser({
            email,
            password: '',
          });
        }

        return {
          ...user,
          email_verified,
        } as User;
      },
    }),
  ],
  callbacks: authConfig.callbacks,
});
