'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { syncLocalBookmarksToServer } from '@/lib/localBookmarks';
import { safeReturnTo, OAUTH_RETURN_TO_KEY } from '@/lib/auth/returnTo';

/**
 * OAuth provider callback state machine.
 *
 * Responsibilities:
 *   1. Pull `code` and `state` from the current URL once the component
 *      has mounted on the client.
 *   2. Validate `state` against the value stashed in sessionStorage
 *      before the redirect (CSRF guard). Clear it on the happy path so
 *      a reload of the callback URL cannot replay the flow.
 *   3. Exchange the `code` with the backend via the provider-specific
 *      function passed in. Redirect to `/feed` on success.
 *   4. Surface a human-readable error string for any failure branch.
 *
 * Why all the work happens in a single post-mount effect:
 *
 *   Hydration safety. The initial state is an empty error string so
 *   the server and the first client render both emit the loading
 *   spinner — identical HTML, no mismatch. Anything that reads
 *   `useSearchParams()` or `sessionStorage` at render time (including
 *   useState initializers and useMemo) would diverge between SSR and
 *   the client: useSearchParams returns empty params during static
 *   rendering, and sessionStorage is browser-only. Both hazards
 *   produced the hydration error this hook used to reproduce.
 *
 *   Strict Mode safety. React dev-mode Strict Mode double-invokes
 *   effects by running setup → cleanup → setup again. OAuth codes are
 *   single-use; letting the exchange run twice would get the second
 *   attempt rejected with bad_verification_code / invalid_grant. The
 *   `processedRef` guard makes the second invocation a no-op. We
 *   deliberately do not return a cleanup function that cancels the
 *   in-flight exchange, because Strict Mode's synthetic cleanup would
 *   then discard the real first exchange's result and leave the user
 *   stuck on the spinner in dev.
 *
 *   The set-state-in-effect lint rule is disabled on the synchronous
 *   validation branches below. The rule is aimed at state that could
 *   be derived from props at render time; here the inputs are external
 *   (URL search params on SSR are empty, sessionStorage is browser
 *   only), so the effect is the only place the validation can honestly
 *   run.
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

  const [error, setError] = useState('');
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    // Read+clear the OAuth stash up front so a failed validation below
    // doesn't leak the returnTo into the next attempt.
    const returnTo = safeReturnTo(sessionStorage.getItem(OAUTH_RETURN_TO_KEY));
    sessionStorage.removeItem(OAUTH_RETURN_TO_KEY);

    if (!code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- See file header: error derives from sessionStorage/URL params that cannot be read at render time on SSR.
      setError('인증 코드가 없습니다.');
      return;
    }

    const storedState = sessionStorage.getItem(sessionStorageKey);
    if (!urlState || urlState !== storedState) {
      setError('잘못된 인증 요청입니다.');
      return;
    }
    sessionStorage.removeItem(sessionStorageKey);

    (async () => {
      try {
        const success = await exchange(code);
        if (success) {
          syncLocalBookmarksToServer();
          setLoggedIn(true);
          router.push(returnTo);
        } else {
          setError(failureMessage);
        }
      } catch {
        setError('오류가 발생했습니다.');
      }
    })();
  }, [code, urlState, sessionStorageKey, exchange, failureMessage, router, setLoggedIn]);

  return { error };
}
