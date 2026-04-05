'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { oauthGoogle } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/provider';
import Link from 'next/link';

function LoadingSpinner() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin h-8 w-8 text-[var(--color-main)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-[var(--color-gray3)]">로그인 처리 중...</p>
      </div>
    </main>
  );
}

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const code = searchParams.get('code');
  const urlState = searchParams.get('state');
  const [error, setError] = useState('');
  const processedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError('인증 코드가 없습니다.');
      return;
    }
    // Strict-mode double-invoke guard: skip if we already started for this code.
    if (processedCodeRef.current === code) return;
    processedCodeRef.current = code;

    const storedState = sessionStorage.getItem('oauth_state_google');
    if (!urlState || urlState !== storedState) {
      setError('잘못된 인증 요청입니다.');
      return;
    }
    sessionStorage.removeItem('oauth_state_google');

    let cancelled = false;
    (async () => {
      try {
        const success = await oauthGoogle(code);
        if (cancelled) return;
        if (success) {
          setLoggedIn(true);
          router.push('/feed');
        } else {
          setError('Google 로그인에 실패했습니다.');
        }
      } catch {
        if (!cancelled) setError('오류가 발생했습니다.');
      }
    })();
    return () => { cancelled = true; };
  }, [code, urlState, router, setLoggedIn]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-[var(--color-error)] mb-4">{error}</p>
          <Link
            href="/auth/login"
            className="text-[var(--color-main)] hover:underline"
          >
            다시 시도
          </Link>
        </div>
      </main>
    );
  }

  return <LoadingSpinner />;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
