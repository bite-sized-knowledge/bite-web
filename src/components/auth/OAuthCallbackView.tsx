import Link from 'next/link';
import LoadingSpinner from './LoadingSpinner';

/**
 * Rendering half of the OAuth callback page. Shows the loading spinner
 * while the code exchange is in flight and a retry panel once the hook
 * surfaces an error. Keeps the provider-specific page components down to
 * a single useOAuthCallback call plus this view.
 */
export default function OAuthCallbackView({ error }: { error: string }) {
  if (!error) return <LoadingSpinner />;

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
