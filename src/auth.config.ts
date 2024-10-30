import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import { AdapterUser } from '@auth/core/adapters';

export const PROTECTED_PAGES = ['/dashboard', '/statistics', '/settings'];
const SIGN_IN_PATH = '/sign-in';
const SIGN_UP_PATH = '/sign-up';

export const authConfig = {
  pages: {
    signIn: SIGN_IN_PATH,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedPage =
        PROTECTED_PAGES.some((path) =>  nextUrl.pathname.startsWith(path));
      if (isOnProtectedPage) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === SIGN_IN_PATH || nextUrl.pathname === SIGN_UP_PATH) {
          return NextResponse.redirect(new URL(PROTECTED_PAGES[0], nextUrl));
        }
      }
      return true;
    },
    async session({ session, token }) {
      session.user = token.user as AdapterUser;
      return session;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.user = {
          ...user,
          id: account?.providerAccountId || user.id,
        };
      }
      if (trigger === 'update' && session) {
        token = { ...token, user: session };
        return token;
      }
      return token;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
