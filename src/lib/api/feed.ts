import { Article } from '@/types/Article';
import { api } from './client';

const HEADER_INTEREST_IDS = 'X-Interest-Ids';

/**
 * localStorage 의 interestIds 를 X-Interest-Ids 헤더 (CSV) 로 변환.
 * 비회원 anonymous 의 device_category_bandit prior 강화에 사용 (recsys-serving).
 * 비어있거나 invalid 이면 헤더 미첨부 → recsys 는 균등 prior.
 */
function interestHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem('interestIds');
  if (!raw) return {};
  try {
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids) || ids.length === 0) return {};
    return { [HEADER_INTEREST_IDS]: ids.map((n: unknown) => String(Number(n))).filter((s) => s !== 'NaN').join(',') };
  } catch {
    return {};
  }
}

/**
 * 추천 탭 호출. lang 자동 감지 안 함 — navigator.language 로 hard filter 면
 * 한국 브라우저가 영어 좋은 글을 영영 못 보는 손실. 사용자가 명시 lang chip
 * (예: latest 탭의 ko/en 필터) 을 설정한 경우에만 lang 적용 (별도 endpoint 사용).
 *
 * authRequired=false: 비회원도 같은 endpoint. X-Device-Id 는 client.ts 자동 첨부.
 */
export const getRecommendedFeed = async () => {
  const data = await api.get<Article[]>('/v1/feed', { headers: interestHeader() }, false);
  return data;
};

interface GetRecentFeedResponse {
  articles: Article[];
  next: string | null;
}

export const getRecentFeed = async (
  from: string | null,
  lang?: string | null,
  blogIds?: string[] | null,
) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (blogIds && blogIds.length > 0) {
    params.set('blogId', blogIds.join(','));
  } else if (lang) {
    params.set('lang', lang);
  }
  const qs = params.toString();
  const res = await api.get<GetRecentFeedResponse>(
    `/v1/articles/recent${qs ? `?${qs}` : ''}`,
  );
  return res.data;
};
