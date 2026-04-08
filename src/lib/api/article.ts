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

export const searchArticles = async (
  query: string,
  signal?: AbortSignal,
  from?: string,
) => {
  let url = `/v1/articles/search?query=${encodeURIComponent(query)}&limit=${ROWS_PER_PAGE}`;
  if (from) {
    url += `&from=${from}`;
  }
  const { data } = await api.get<{ articles: Article[]; next?: string }>(
    url,
    { signal },
    false,
  );
  return { articles: data?.articles ?? [], next: data?.next ?? null };
};
