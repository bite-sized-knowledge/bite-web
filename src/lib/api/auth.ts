import { api } from './client';

// accessToken을 localStorage에서 가져오는 함수
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// refreshToken is now stored in httpOnly cookie (not accessible from JS)
export const getRefreshToken = (): string | null => {
  return null; // refresh token is in httpOnly cookie
};

export const setAccessToken = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken);
};

export const setRefreshToken = (_refreshToken: string) => {
  // refresh token is now set as httpOnly cookie by the server
  // no-op on client side
};

// refreshToken을 이용하여 새로운 accessToken을 발급받는 함수
// refresh token은 httpOnly 쿠키로 자동 전송됨
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
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
      // refresh token is set as httpOnly cookie by the server
      return true;
    }

    localStorage.removeItem('accessToken');
    return false;
  } catch {
    return false;
  }
};

export const authenticationEmail = async (email: string) => {
  return await api.post(
    '/v1/auth/email/request-verify',
    { email },
    {},
    false,
  );
};

export const verifyEmail = async (email: string): Promise<boolean> => {
  try {
    const { data } = await api.get<boolean>(
      `/v1/auth/email/is-verified?email=${email}`,
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
    const { error } = await api.get(
      `/v1/members/name/check?name=${name}`,
      {},
      false,
    );
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

export const signUp = async ({ email, password, birth }: SignUpParam) => {
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
      return true;
    }

    localStorage.removeItem('accessToken');
    return false;
  } catch {
    return false;
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

export const passwordMatch = async (email: string, password: string) => {
  try {
    const { data, error } = await api.post<IToken>(
      '/v1/auth/login',
      { email, password },
      {},
      false,
    );

    if (!error && data) return true;
    return false;
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
      // refresh token is set as httpOnly cookie by the server
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
      // refresh token is set as httpOnly cookie by the server
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
