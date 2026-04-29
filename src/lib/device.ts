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
