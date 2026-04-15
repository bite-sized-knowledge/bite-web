import { Article } from '@/types/Article';
import { api } from './client';

interface BlogDetail {
  id: string;
  title: string;
  url: string;
  favicon: string;
  isSubscribed: boolean;
}

interface BlogArticleResponse {
  articles: Omit<Article, 'blog'>[];
  next: string;
}

export type BlogResponse = BlogDetail;

interface ListBlogsResponse {
  blogs: BlogDetail[];
}

export const getBlogs = async () => {
  const { data } = await api.get<ListBlogsResponse>('/v1/blogs');
  return data?.blogs ?? [];
};

export const getBlog = async (blogId: string) => {
  const data = await api.get<BlogResponse>(`/v1/blogs/${blogId}`);
  return data;
};

/**
 * 블로그 아티클 조회
 * @param blogId 블로그 ID
 * @param limit 조회 개수
 * @param from 조회 시작 게시글 ID
 */
export const getBlogArticle = async (
  blogId: string,
  limit: number,
  from: string | null,
) => {
  if (!blogId) return;

  let url = `/v1/blogs/${blogId}/articles?limit=${limit}`;
  if (from) {
    url += `&from=${from}`;
  }

  const { data } = await api.get<BlogArticleResponse>(url);
  return data;
};
