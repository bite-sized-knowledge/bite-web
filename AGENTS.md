<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# bite-web — Claude 작업 메모

## 검색 분석 이벤트

- `src/lib/device.ts` `getSessionId()`: sessionStorage 기반. 탭 종료 = 새 검색 세션이라는 의미와 일치.
- `sendEvent`는 `getSessionId()`를 자동 첨부. 익명 사용자도 동작.
- `S_IMP / S_PREVIEW / S_CLICK / S_PREVIEW_DISMISS` 모두 metadata에 `{queryId, mode, filters: {categoryId, lang}}` 첨부.
- `query_id`는 첫 페이지 응답에서 받아 모든 후속 페이지/이벤트에서 동일하게 사용. 클라이언트는 새로 발급 안 함.

## ⚠️ 검색 페이지 hooks 함정 (실제 겪음)

- `ranking` 객체는 반드시 `useMemo`. categoryId/lang은 별도 `rankingFilters` memo로 묶고, 그걸 deps에 넣어 `ranking`을 만들 것. 매 렌더 새 객체면 자식 컴포넌트의 `S_PREVIEW` useEffect dep가 깨져 중복 발사.
- `S_PREVIEW` useEffect deps는 `[article.id, ranking?.queryId]`. queryId가 바뀌면 같은 article도 새 검색 세션 의도로 한 번 더 발사 — 의도된 동작이라 deps에 queryId 포함이 맞음.

## Next.js 16

- `useSearchParams`는 `<Suspense>`로 감싸야 prerender 안전. 안 그러면 build error.
- dev 서버: `next dev --hostname 0.0.0.0` (Cloudflare tunnel 접근 위해 필수).
- 핫리로드 자체가 개발계 반영. 별도 배포 단계 없음.

## 스타일

- Feed 레이아웃은 `globals.css @media`로 정의. Tailwind `lg:` variant 쓰지 말 것 (기존 코드 패턴).

## 컨테이너

- dev: `bite-web-dev` (3001, image `bite-web:dev`).
- prod: `bite-web` (3000, image `bite-web:latest`).
- 분리 운영. 운영 배포는 사용자 명시 요청 시에만.

