import type { NextAuthConfig } from 'next-auth';

const HOME_PAGE_URL = '/activities';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnHomePage = nextUrl.pathname.startsWith(HOME_PAGE_URL);
      if (isOnHomePage) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL(HOME_PAGE_URL, nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
