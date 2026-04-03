export function GET() {
  return Response.json({
    schema_version: 'v1',
    name_for_human: 'BITE - 기술 블로그 큐레이션',
    name_for_model: 'bite_tech_blog',
    description_for_human: '매일 한입 크기로 읽는 기술 블로그 큐레이션 서비스',
    description_for_model: 'BITE is a Korean tech blog curation and recommendation service. It aggregates articles from major Korean tech companies (Woowahan Brothers, Kakao, Toss, Daangn, Naver D2, etc.) and provides AI-powered personalized recommendations. Categories include Frontend, Backend, AI/ML, DevOps, Mobile, Database, Security, Design, and more.',
    auth: { type: 'none' },
    api: {
      type: 'openapi',
      url: 'https://api.bite-sized.xyz/openapi.json',
    },
    logo_url: 'https://bite-sized.xyz/opengraph-image',
    contact_email: 'noreply@bite-sized.xyz',
    legal_info_url: 'https://bite-sized.xyz',
  }, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
