'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';

// next-themes renders an inline <script> to apply the theme before paint.
// It only needs to run from the server HTML; on the client React 19 warns
// about rendering <script>, so mark it as non-executable there.
const scriptProps =
  typeof window === 'undefined' ? undefined : { type: 'application/json' };

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider scriptProps={scriptProps} {...props}>
      {children}
    </NextThemesProvider>
  );
}
