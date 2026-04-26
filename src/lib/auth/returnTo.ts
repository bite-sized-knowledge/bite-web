const DEFAULT_RETURN_TO = '/feed';

/**
 * Validate a `?returnTo=` query parameter against open-redirect attacks.
 *
 * Accepts only same-origin paths: must start with `/` and must not start
 * with `//` (protocol-relative) or any scheme like `http:`. Falsy or
 * invalid input falls back to `/feed`.
 */
export function safeReturnTo(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_RETURN_TO;
  if (!raw.startsWith('/') || raw.startsWith('//')) return DEFAULT_RETURN_TO;
  // Reject `/x:foo`-style payloads that some URL parsers treat as a scheme.
  // Belt-and-suspenders alongside the `//` check above.
  if (/^\/[^/]*:/.test(raw)) return DEFAULT_RETURN_TO;
  return raw;
}

export const RETURN_TO_PARAM = 'returnTo';
export const OAUTH_RETURN_TO_KEY = 'postOAuthReturnTo';
