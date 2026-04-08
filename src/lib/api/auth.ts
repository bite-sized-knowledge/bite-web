import { getApiBaseUrl } from './baseUrl';
import { api } from './client';
import { getDeviceId } from '@/lib/device';

// The refresh token lives in an httpOnly cookie set by the backend on
// login/guest-creation and is never touched from JS. Only the access
// token is kept in localStorage for attaching to outbound requests.

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken);
};

// refreshToken을 이용하여 새로운 accessToken을 발급받는 함수
// refresh token은 httpOnly 쿠키로 자동 전송됨
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/v1/auth/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'include',
      },
    );

    const data = await response.json();

    if (data.success && data.result.accessToken) {
      localStorage.setItem('accessToken', data.result.accessToken);
      return data.result.accessToken;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch {
    throw new Error('Failed to refresh token');
  }
};

export interface IToken {
  token: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * 로그인
 * @param email 이메일
 * @param password 비밀번호
 */
/**
 * Merge anonymous events collected before login with the now-authenticated member.
 * Fire-and-forget — failure should not block the auth flow.
 */
export const mergeAnonymousEvents = () => {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  api.post('/v1/events/merge', { deviceId }).catch(() => {});
};

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await api.post<IToken>(
      '/v1/auth/login',
      { email, password },
      {},
      false,
    );

    if (!error && data) {
      localStorage.setItem('accessToken', data.token.accessToken);
      mergeAnonymousEvents();
      return true;
    }

    localStorage.removeItem('accessToken');
    return false;
  } catch {
    return false;
  }
};

export const authenticationEmail = async (email: string) => {
  return await api.post('/v1/auth/email/request-verify', { email }, {}, false);
};

export const verifyEmail = async (email: string): Promise<boolean> => {
  try {
    const { data } = await api.get<boolean>(
      `/v1/auth/email/is-verified?email=${encodeURIComponent(email)}`,
      {},
      false,
    );
    return data ?? false;
  } catch {
    return false;
  }
};

export const checkNameDuplication = async (name: string) => {
  try {
    const { error } = await api.get(`/v1/members/name/check?name=${encodeURIComponent(name)}`);
    return error === null;
  } catch {
    return false;
  }
};

interface SignUpParam {
  email: string;
  password: string;
  birth: number;
}

interface SignUpResult {
  success: boolean;
  errorMessage?: string;
}

export const signUp = async ({ email, password, birth }: SignUpParam): Promise<SignUpResult> => {
  try {
    const { data, error } = await api.post<IToken>(
      '/v1/members/join',
      { email, password, birth },
      {},
      false,
    );

    if (!error && data) {
      localStorage.setItem('accessToken', data.token.accessToken);
      // refresh token is set as httpOnly cookie by the server
      mergeAnonymousEvents();
      return { success: true };
    }

    // Do NOT remove the guest access token here — it is still needed
    // for retries and other protected calls during the signup flow.
    return { success: false, errorMessage: error?.message };
  } catch {
    return { success: false, errorMessage: '네트워크 오류가 발생했습니다.' };
  }
};

export const withDraw = async (memberId: string) => {
  try {
    const { status } = await api.delete(`/v1/members/${memberId}`);

    if (status) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('interestIds');
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

/**
 * Verify that an email/password combination matches the current user's
 * credentials. Implemented by attempting a login (the backend has no
 * dedicated verify endpoint). Returns true on success without persisting
 * any new tokens beyond what login() already stores.
 */
export const passwordMatch = async (
  email: string,
  password: string,
): Promise<boolean> => {
  if (!email) return false;
  return login(email, password);
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const { error, status } = await api.post('/v1/auth/password/change', {
      currentPassword,
      newPassword,
    });

    if (error) return false;
    return status;
  } catch {
    return false;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error, status } = await api.post(
      '/v1/auth/password/reset',
      { email },
      {},
      false,
    );

    if (error) return false;
    return status;
  } catch {
    return false;
  }
};

// OAuth endpoints
export const oauthGithub = async (code: string) => {
  try {
    const { data, error } = await api.post<IToken>(
      '/v1/auth/oauth/github',
      { code },
      {},
      false,
    );

    if (!error && data) {
      localStorage.setItem('accessToken', data.token.accessToken);
      mergeAnonymousEvents();
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const oauthGoogle = async (code: string) => {
  try {
    const { data, error } = await api.post<IToken>(
      '/v1/auth/oauth/google',
      { code },
      {},
      false,
    );

    if (!error && data) {
      localStorage.setItem('accessToken', data.token.accessToken);
      mergeAnonymousEvents();
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
