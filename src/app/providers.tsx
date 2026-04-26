'use client';

import { ReactNode } from 'react';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth/provider';
import { ThemeProvider } from '@/lib/theme/provider';
import { ToastProvider } from '@/components/ui/Toast';
import { LoginPromptProvider } from '@/lib/auth/loginPrompt';
import { FeedScrollProvider } from '@/hooks/useFeedScroll';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <LoginPromptProvider>
              <FeedScrollProvider>{children}</FeedScrollProvider>
            </LoginPromptProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
