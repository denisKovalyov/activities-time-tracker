import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/ui/providers/theme-provider';
import { AuthProvider } from '@/ui/providers/auth-provider';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | ATT',
    default: 'Activities Time Tracker',
  },
  description: 'Web application to track time spent on various activities.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
    </body>
  </html>
)};
