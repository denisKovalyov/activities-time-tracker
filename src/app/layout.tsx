import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';

import { ThemeProvider } from '@/ui/providers/theme-provider';
import { AuthProvider } from '@/ui/providers/auth-provider';
import { Toaster } from '@/ui/common/toaster';
import { montserrat, lato } from '@/app/fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    template: `%s | ${process.env.APP_SHORT_NAME}`,
    default: process.env.APP_NAME as string,
  },
  description: `${process.env.APP_DESCRIPTION}`,
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={`${lato.variable} ${montserrat.variable} font-sans bg-muted`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </ThemeProvider>
    </body>
    </html>
  );
}
