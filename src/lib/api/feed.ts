import { Article } from '@/types/Article';
import { api } from './client';

export const getRecommendedFeed = async () => {
  const data = await api.get<Article[]>('/v1/feed');
  return data;
};

interface GetRecentFeedResponse {
  articles: Article[];
  next: string | null;
}

export const getRecentFeed = async (
  from: string | null,
  lang?: string | null,
  blogId?: string | null,
) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (blogId) {
    params.set('blogId', blogId);
  } else if (lang) {
    params.set('lang', lang);
  }
  const qs = params.toString();
  const res = await api.get<GetRecentFeedResponse>(
    `/v1/articles/recent${qs ? `?${qs}` : ''}`,
  );
  return res.data;
};
