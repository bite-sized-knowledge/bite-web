import { ApiErrorResult, ApiResponse } from '@/types/api';
import {
  getAccessToken,
  mergeAnonymousEvents,
  refreshAccessToken,
  setAccessToken,
} from './auth';
import { getApiBaseUrl } from './baseUrl';
import { getDeviceId } from '@/lib/device';

const DEFAULT_TIMEOUT = 30000;
const HEADER_DEVICE_ID = 'X-Device-Id';
const HEADER_GUEST_TOKEN = 'X-Guest-Token';

const getApiErrorMessage = (result: ApiErrorResult | unknown) => {
  if (
    typeof result === 'object' &&
    result !== null &&
    'message' in result &&
    typeof result.message === 'string'
  ) {
    return result.message;
  }

  return '네트워크 에러가 발생했습니다';
};

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? getApiBaseUrl();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private get resolvedBaseUrl(): string {
    // Re-resolve lazily — the singleton is constructed during SSR when
    // window isn't available, so an empty construction-time result
    // gets replaced by the hostname-derived URL once we're in the
    // browser.
    return this.baseUrl || getApiBaseUrl();
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number },
  ): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authRequired: boolean = true,
    hasRetried: boolean = false,
  ): Promise<{ data: T | null; error: Error | null; status: boolean }> {
    try {
      const url = `${this.resolvedBaseUrl}${endpoint}`;

      let accessToken: string | null = null;
      if (authRequired) {
        accessToken = getAccessToken();
      }

      const deviceId = getDeviceId();

      const headers: Record<string, string> = {
        ...this.defaultHeaders,
        ...(deviceId ? { [HEADER_DEVICE_ID]: deviceId } : {}),
        ...(authRequired && accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
        ...(options.headers as Record<string, string>),
      };

      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const guestToken = response.headers.get(HEADER_GUEST_TOKEN);
      if (guestToken) {
        // Only fire merge on first receipt. Rapid FK-action bursts return
        // X-Guest-Token on every response until the client captures it; without
        // this guard, mergeAnonymousEvents would POST N times per burst.
        const alreadyHadToken = accessToken !== null;
        setAccessToken(guestToken);
        if (!alreadyHadToken) {
          mergeAnonymousEvents();
        }
      }

      // 만약 토큰이 만료되었을 경우 (401 Unauthorized), 리프레시 토큰으로 새로운 액세스 토큰을 발급받고 다시 요청
      if (authRequired && response.status === 401 && !hasRetried) {
        try {
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            return this.request<T>(
              endpoint,
              {
                ...options,
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              },
              authRequired,
              true,
            );
          }
        } catch {
          // Refresh failed (expired/invalid refresh token) — clear session and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('interestIds');
            window.location.href = '/auth/login';
          }
          return {
            data: null,
            error: new Error('세션이 만료되었습니다. 다시 로그인해주세요.'),
            status: false,
          };
        }
      }

      if (response.status === 204) {
        return {
          data: null,
          error: null,
          status: true,
        };
      }

      const data = (await response.json().catch(() => null)) as
        | ApiResponse<T>
        | null;

      if (data) {
        if (!data.success) {
          return {
            data: null,
            error: new Error(getApiErrorMessage(data.result)),
            status: false,
          };
        }

        return {
          data: data.result as T | null,
          error: null,
          status: true,
        };
      }

      return {
        data: null,
        error: response.ok
          ? null
          : new Error(`요청에 실패했습니다 (${response.status})`),
        status: response.ok,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.name === 'AbortError'
              ? new Error('요청 시간이 초과되었습니다')
              : error
            : new Error('알 수 없는 에러가 발생했습니다'),
        status: false,
      };
    }
  }

  async get<T>(
    endpoint: string,
    options: RequestInit = {},
    authRequired = true,
  ) {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, authRequired);
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {},
    authRequired = true,
  ) {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      },
      authRequired,
    );
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    options: RequestInit = {},
    authRequired = true,
  ) {
    return this.request<T>(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
      },
      authRequired,
    );
  }

  async delete<T>(
    endpoint: string,
    options: RequestInit = {},
    authRequired = true,
  ) {
    return this.request<T>(
      endpoint,
      { ...options, method: 'DELETE' },
      authRequired,
    );
  }
}

export const api = new ApiClient();
