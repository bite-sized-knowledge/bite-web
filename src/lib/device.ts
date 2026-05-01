const STORAGE_KEY = 'bite_device_id';
const SESSION_KEY = 'bite_session_id';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * sessionStorage 기반 세션 식별자. 탭이 닫히면 새 세션으로 간주된다.
 * 검색 세션 단위 분석(검색→스크롤→클릭 시퀀스)에 사용.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const FEED_REQUEST_KEY = 'bite_feed_request_id';

/**
 * /v1/feed 호출 시 응답 헤더 X-Feed-Request-Id 를 sessionStorage 에 저장.
 * 다음 user_events 가 이 값을 첨부 → recsys 의 impression ↔ click 정확 그룹핑.
 * 새 /v1/feed 응답마다 덮어씀 (가장 최근 응답에서 발생한 클릭만 정확 매핑).
 */
export function setFeedRequestId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) sessionStorage.setItem(FEED_REQUEST_KEY, id);
  else sessionStorage.removeItem(FEED_REQUEST_KEY);
}

export function getFeedRequestId(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(FEED_REQUEST_KEY) ?? '';
}
