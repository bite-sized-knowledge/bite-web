import { decodeJwt } from 'jose';
import { getAccessToken } from '@/lib/api/auth';

export interface JwtPayload {
  sub: string;
  name: string;
  birth: number;
  email: string;
}

/**
 * Decode the current access token and return the payload, or null on failure.
 */
export function getJwtPayload(): JwtPayload | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return decodeJwt(token) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract a single claim from the JWT. Returns the fallback when the
 * token is missing or the claim is absent.
 */
export function getJwtClaim<K extends keyof JwtPayload>(
  key: K,
  fallback: JwtPayload[K] | '' = '' as JwtPayload[K] | '',
): JwtPayload[K] | '' {
  const payload = getJwtPayload();
  return payload?.[key] ?? fallback;
}
