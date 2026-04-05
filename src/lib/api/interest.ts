import { api } from './client';
import { IToken, setAccessToken } from './auth';

interface Interest {
  id: number;
  name: string;
  image: string;
}

export const getInterests = async () => {
  const { data } = await api.get<Interest[]>('/v1/meta/interests', {}, false);
  return data;
};

export const getGuestAccount = async (interestIds: number[]) => {
  try {
    const { data } = await api.post<IToken>(
      '/v1/members',
      { interestIds },
      {},
      false,
    );

    if (!data) return false;

    // Refresh token is delivered via httpOnly cookie by the server.
    setAccessToken(data.token.accessToken);

    return true;
  } catch {
    return false;
  }
};
