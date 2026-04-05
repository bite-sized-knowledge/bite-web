'use client';

import { Suspense } from 'react';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import OAuthCallbackView from '@/components/auth/OAuthCallbackView';
import { useOAuthCallback } from '@/lib/auth/useOAuthCallback';
import { oauthGoogle } from '@/lib/api/auth';

function GoogleCallbackContent() {
  const { error } = useOAuthCallback(
    'oauth_state_google',
    oauthGoogle,
    'Google 로그인에 실패했습니다.',
  );
  return <OAuthCallbackView error={error} />;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
