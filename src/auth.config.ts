import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const PROTECTED_PAGE_PATH = '/dashboard';
const SIGN_IN_PATH = '/sign-in';

export const authConfig = {
  pages: {
    signIn: SIGN_IN_PATH,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedPage = nextUrl.pathname.startsWith(PROTECTED_PAGE_PATH);
      if (isOnProtectedPage) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === SIGN_IN_PATH) {
          return NextResponse.redirect(new URL(PROTECTED_PAGE_PATH, nextUrl));
        }
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
