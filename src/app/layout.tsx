import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/ui/providers/theme-provider';
import { AuthProvider } from '@/ui/providers/auth-provider';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.variable} ${montserrat.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
