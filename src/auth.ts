import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import type { Credentials } from '@/lib/definitions';
import { AdapterUser } from '@auth/core/adapters';
import { authConfig } from './auth.config';
import { getUser } from '@/lib/actions/data/user';

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
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token, user }) {
      session.user = token.user as AdapterUser;
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = user;
      }
      if (trigger === 'update' && session) {
        token = { ...token, user: session };
        return token;
      }
      return token;
    },
  },
});
