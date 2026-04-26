'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { LoginPromptSheet } from '@/components/auth/LoginPromptSheet';
import { RETURN_TO_PARAM } from '@/lib/auth/returnTo';

interface LoginPromptContextValue {
  /**
   * Auth gate helper. Returns true if the user is logged in (caller proceeds).
   * Returns false and opens the prompt if not (caller should early-return).
   */
  requireAuth: (reason: string) => boolean;
}

const LoginPromptContext = createContext<LoginPromptContextValue | null>(null);

export function LoginPromptProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  // null = closed. Holding the reason string also serves as the open flag,
  // so framer-motion's exit animation keeps the previous text visible.
  const [reason, setReason] = useState<string | null>(null);

  const requireAuth = useCallback(
    (nextReason: string) => {
      if (isLoggedIn) return true;
      setReason(nextReason);
      return false;
    },
    [isLoggedIn],
  );

  const handleClose = useCallback(() => {
    setReason(null);
  }, []);

  const handleLogin = useCallback(() => {
    const returnTo =
      typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/feed';
    setReason(null);
    router.push(`/auth/login?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}`);
  }, [router]);

  const value = useMemo<LoginPromptContextValue>(
    () => ({ requireAuth }),
    [requireAuth],
  );

  return (
    <LoginPromptContext.Provider value={value}>
      {children}
      <LoginPromptSheet
        open={reason !== null}
        reason={reason ?? ''}
        onLogin={handleLogin}
        onClose={handleClose}
      />
    </LoginPromptContext.Provider>
  );
}

export function useLoginPrompt() {
  const ctx = useContext(LoginPromptContext);
  if (!ctx) {
    throw new Error('useLoginPrompt must be used within <LoginPromptProvider>');
  }
  return ctx;
}
