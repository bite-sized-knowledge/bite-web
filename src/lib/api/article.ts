import { Article } from '@/types/Article';
import { api } from './client';
import { QueryFunctionContext } from '@tanstack/react-query';

const ROWS_PER_PAGE = 10;

export const like = async (articleId: string) => {
  const data = await api.post(`/v1/articles/${articleId}/likes`, {});
  return data;
};

export const unlike = async (articleId: string) => {
  const data = await api.delete(`/v1/articles/${articleId}/likes`);
  return data;
};

export const share = async (articleId: string) => {
  const data = await api.post(`/v1/articles/${articleId}/shares`, {});
  return data;
};

export const unInterest = async (articleId: string) => {
  const data = await api.post(`/v1/articles/${articleId}/uninterests`, {});
  return data;
};

export const addBookmark = async (articleId: string) => {
  const data = await api.post(`/v1/articles/${articleId}/bookmarks`, {});
  return data;
};

export const deleteBookmark = async (articleId: string) => {
  const data = await api.delete(`/v1/articles/${articleId}/bookmarks`);
  return data;
};

export const getBookmarkedArticles = async (
  context: QueryFunctionContext<
    readonly ['bookmarks'],
    string | null
  >,
) => {
  const { pageParam } = context;

  let url = `/v1/articles/bookmarks?limit=${ROWS_PER_PAGE}`;
  if (pageParam) {
    url += `&from=${pageParam}`;
  }

  const { data } = await api.get<{ articles: Article[]; next: string | null }>(url);
  return data;
};

export const getHistory = async (
  context: QueryFunctionContext<
    readonly ['history'],
    string | null
  >,
) => {
  const { pageParam } = context;

  let url = `/v1/articles/history?limit=${ROWS_PER_PAGE}`;
  if (pageParam) {
    url += `&from=${pageParam}`;
  }

  const { data } = await api.get<{ articles: Article[]; next: string | null }>(url);
  return data;
};

export const getLikedArticles = async (
  context: QueryFunctionContext<
    readonly ['likes'],
    string | null
  >,
) => {
  const { pageParam } = context;

  let url = `/v1/articles/likes?limit=${ROWS_PER_PAGE}`;
  if (pageParam) {
    url += `&from=${pageParam}`;
  }

  const { data } = await api.get<{ articles: Article[]; next: string | null }>(url);
  return data;
};

export type SearchFilters = {
  categoryId?: number;
  lang?: 'ko' | 'en';
  blogId?: number;
  mode?: 'hybrid' | 'dense' | 'fulltext';
};

export const searchArticles = async (
  query: string,
  signal?: AbortSignal,
  from?: string,
  filters?: SearchFilters,
) => {
  const params = new URLSearchParams();
  params.set('query', query);
  params.set('limit', String(ROWS_PER_PAGE));
  if (from) params.set('from', from);
  if (filters?.categoryId !== undefined) params.set('category_id', String(filters.categoryId));
  if (filters?.lang) params.set('lang', filters.lang);
  if (filters?.blogId !== undefined) params.set('blog_id', String(filters.blogId));
  if (filters?.mode) params.set('mode', filters.mode);

  const url = `/v1/articles/search?${params.toString()}`;
  const { data } = await api.get<{ articles: Article[]; next?: string }>(
    url,
    { signal },
    false,
  );
  return { articles: data?.articles ?? [], next: data?.next ?? null };
};

export const suggestQueries = async (
  prefix: string,
  signal?: AbortSignal,
  limit: number = 8,
): Promise<string[]> => {
  const params = new URLSearchParams();
  if (prefix) params.set('q', prefix);
  params.set('limit', String(limit));
  const url = `/v1/articles/suggest?${params.toString()}`;
  const { data } = await api.get<{ suggestions: string[] }>(
    url,
    { signal },
    false,
  );
  return data?.suggestions ?? [];
};
