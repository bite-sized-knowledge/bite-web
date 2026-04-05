'use client';

import { Suspense } from 'react';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import OAuthCallbackView from '@/components/auth/OAuthCallbackView';
import { useOAuthCallback } from '@/lib/auth/useOAuthCallback';
import { oauthGithub } from '@/lib/api/auth';

function GitHubCallbackContent() {
  const { error } = useOAuthCallback(
    'oauth_state_github',
    oauthGithub,
    'GitHub 로그인에 실패했습니다.',
  );
  return <OAuthCallbackView error={error} />;
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GitHubCallbackContent />
    </Suspense>
  );
}
