/**
 * Full-screen loading spinner shown while an auth flow (OAuth callback,
 * redirect handoff) is resolving. Kept as a standalone component so the
 * OAuth callback pages can render it both as a Suspense fallback and as
 * their own in-flight state without duplicating markup.
 */
export default function LoadingSpinner({
  message = '로그인 처리 중...',
}: {
  message?: string;
}) {
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
        <p className="text-[var(--color-gray3)]">{message}</p>
      </div>
    </main>
  );
}
