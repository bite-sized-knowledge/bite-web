'use client';

import { ReactNode } from 'react';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth/provider';
import { ThemeProvider } from '@/lib/theme/provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
