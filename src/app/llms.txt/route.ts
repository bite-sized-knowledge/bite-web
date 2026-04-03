export function GET() {
  const content = `# BITE - 한입 크기 기술 지식

> 매일 한입 크기로 읽는 기술 블로그 큐레이션 서비스

BITE는 국내 주요 기술 블로그(우아한형제들, 카카오, 토스, 당근, 네이버 D2 등)의 아티클을 매일 수집하고, AI 기반 추천 시스템으로 개인화된 기술 콘텐츠를 제공하는 서비스입니다.

## 주요 기능
- 기술 블로그 아티클 자동 수집 및 큐레이션
- AI 기반 개인화 추천 피드
- 카테고리별 분류 (Frontend, Backend, AI/ML, DevOps 등 13개)
- 북마크, 좋아요, 공유 기능
- 최신순 / 추천순 피드

## 기술 스택
- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Go (Echo), MySQL, Qdrant (Vector DB)
- ML: Python, LangChain, Ollama (Embedding), vLLM
- Infra: Docker, Cloudflare Tunnel

## 링크
- 웹사이트: https://bite-sized.xyz
- 피드: https://bite-sized.xyz/feed

## API
- 기술 블로그 목록: GET /v1/blogs
- 최신 아티클: GET /v1/articles/recent
- 아티클 검색: GET /v1/articles/search?query={query}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
