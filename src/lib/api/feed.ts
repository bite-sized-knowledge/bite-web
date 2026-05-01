import { Article } from '@/types/Article';
import { api } from './client';

const HEADER_INTEREST_IDS = 'X-Interest-Ids';

/**
 * 사용자 언어 선호 결정.
 * - 우선: localStorage 의 명시 설정 (현재 미지원, 미래 onboarding 확장 hook).
 * - 차순위: navigator.language (예: ko-KR → ko, en-US → en).
 * - 알 수 없으면 undefined → recsys 가 모든 lang pass-through.
 */
function detectLang(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const raw = navigator.language || navigator.languages?.[0];
  if (!raw) return undefined;
  const head = raw.split('-')[0]?.toLowerCase();
  if (head === 'ko' || head === 'en') return head;
  return undefined;
}

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

export const getRecommendedFeed = async () => {
  const lang = detectLang();
  const qs = lang ? `?lang=${lang}` : '';
  // authRequired=false: 비회원도 같은 endpoint. token 없으면 그냥 device_id 기반 anonymous 흐름.
  // X-Device-Id 는 client.ts 가 자동 첨부. 401 retry 사이클 회피.
  const data = await api.get<Article[]>(`/v1/feed${qs}`, { headers: interestHeader() }, false);
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
