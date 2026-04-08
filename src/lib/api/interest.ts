import { api } from './client';
import { IToken, setAccessToken, mergeAnonymousEvents } from './auth';

export interface Interest {
  id: number;
  name: string;
  image: string;
  thumbnail: string;
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

    setAccessToken(data.token.accessToken);
    mergeAnonymousEvents();

    return true;
  } catch {
    return false;
  }
};

/** Save interests for a logged-in member. */
export const saveInterests = async (interestIds: number[]) => {
  const { error } = await api.put('/v1/members/interests', { interestIds });
  return !error;
};

/** Get the current member's selected interest IDs. */
export const getMyInterests = async () => {
  const { data } = await api.get<number[]>('/v1/members/interests');
  return data;
};
