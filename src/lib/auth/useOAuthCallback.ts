'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';

/**
 * OAuth provider callback state machine.
 *
 * Responsibilities:
 *   1. Pull `code` and `state` from the current URL.
 *   2. Validate the `state` against what was stashed in sessionStorage
 *      before the redirect (CSRF guard). Clear it on the happy path so
 *      a reload of the callback URL cannot be replayed.
 *   3. Exchange the `code` with the backend via the provider-specific
 *      function passed in. Redirect to `/feed` on success.
 *   4. Surface a human-readable error string for any failure branch.
 *
 * Design notes:
 *   - The synchronous error branches (missing code, state mismatch) are
 *     computed at render time via a lazy useState initializer. Because
 *     this hook is only used inside components wrapped in a `<Suspense
 *     fallback>` that depends on `useSearchParams()`, Next.js renders
 *     only the fallback on the server and the hook never runs there, so
 *     reading sessionStorage in the initializer is safe.
 *   - The initializer is pure (no side effects). The earlier bug was
 *     caused by `sessionStorage.removeItem` inside the initializer, which
 *     React Strict Mode's double invocation turned into a false mismatch
 *     on the second call. The removeItem now lives in the effect, behind
 *     a ref guard keyed on the code so it runs at most once per code.
 *   - The `processedCodeRef` guard protects the one-shot OAuth code from
 *     being redeemed twice when Strict Mode remounts effects in dev; the
 *     provider would otherwise reject the second attempt with
 *     `bad_verification_code` / `invalid_grant`.
 */
export interface OAuthCallbackState {
  error: string;
}

export function useOAuthCallback(
  sessionStorageKey: string,
  exchange: (code: string) => Promise<boolean>,
  failureMessage: string,
): OAuthCallbackState {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const code = searchParams.get('code');
  const urlState = searchParams.get('state');

  const [error, setError] = useState<string>(() => {
    if (!code) return '인증 코드가 없습니다.';
    const storedState = sessionStorage.getItem(sessionStorageKey);
    if (!urlState || urlState !== storedState) return '잘못된 인증 요청입니다.';
    return '';
  });
  const processedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!code || error) return;
    if (processedCodeRef.current === code) return;
    processedCodeRef.current = code;

    // State was validated in the initializer; we can safely retire the
    // stored value so a refresh of this URL cannot replay the flow.
    sessionStorage.removeItem(sessionStorageKey);

    let cancelled = false;
    (async () => {
      try {
        const success = await exchange(code);
        if (cancelled) return;
        if (success) {
          setLoggedIn(true);
          router.push('/feed');
        } else {
          setError(failureMessage);
        }
      } catch {
        if (!cancelled) setError('오류가 발생했습니다.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, error, router, setLoggedIn, sessionStorageKey, exchange, failureMessage]);

  return { error };
}
