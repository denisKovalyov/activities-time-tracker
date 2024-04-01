import type { NextAuthConfig } from 'next-auth';

const PROTECTED_PAGE_URL = '/activities';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedPage = nextUrl.pathname.startsWith(PROTECTED_PAGE_URL);
      if (isOnProtectedPage) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL(PROTECTED_PAGE_URL, nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
