import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { sql } from '@vercel/postgres';
import type { User, Credentials } from '@/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { handlers: { GET, POST }, auth, signIn, signOut, unstable_update: update } = NextAuth({
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
    })
  ],
  callbacks: {
    async session({session, token, user}) {
      session.user = token.user as User;
      return session;
    },
    async jwt({token, user, trigger, session}) {
      if (user) {
        token.user = user;
      }
      if (trigger === "update" && session) {
        token = {...token, user: session}
        return token;
      }
      return token;
    },
  },
});
