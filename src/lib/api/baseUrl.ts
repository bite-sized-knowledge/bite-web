/**
 * Resolve the API base URL for client-side code.
 *
 * Next.js inlines `NEXT_PUBLIC_*` env vars at build time. Our Docker
 * image is built in CI where the value isn't set, so client bundles
 * ship with an empty string — setting the env var at runtime via
 * docker-compose only helps server-side code.
 *
 * To keep the web container immutable across prod and dev without
 * rebuilding, fall back to a hostname-based map. The env var still
 * wins when present (local dev via `.env.local`), so local overrides
 * keep working.
 */
const HOSTNAME_MAP: Record<string, string> = {
  'bite-sized.xyz': 'https://api.bite-sized.xyz',
  'www.bite-sized.xyz': 'https://api.bite-sized.xyz',
  'dev.bite-sized.xyz': 'https://dev-api.bite-sized.xyz',
};

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const mapped = HOSTNAME_MAP[window.location.hostname];
    if (mapped) return mapped;
  }

  return '';
}
