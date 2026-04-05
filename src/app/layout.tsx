import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ResponsiveNav } from "@/components/layout/ResponsiveNav";
import { NavigationPadding } from "@/components/layout/NavigationPadding";

export const metadata: Metadata = {
  metadataBase: new URL('https://bite-sized.xyz'),
  title: {
    default: 'BITE - 한입 크기 기술 지식',
    template: '%s | BITE',
  },
  description: '매일 한입 크기로 읽는 기술 블로그 큐레이션. 우아한형제들, 카카오, 토스, 당근 등 국내 주요 기술 블로그를 매일 큐레이션합니다.',
  keywords: ['기술 블로그', 'tech blog', '개발', '프로그래밍', 'BITE', '기술 블로그 추천', '개발자 뉴스', '기술 아티클'],
  alternates: {
    canonical: 'https://bite-sized.xyz',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://bite-sized.xyz',
    siteName: 'BITE',
    title: 'BITE - 한입 크기 기술 지식',
    description: '매일 한입 크기로 읽는 기술 블로그 큐레이션. 우아한형제들, 카카오, 토스, 당근 등 국내 주요 기술 블로그를 매일 큐레이션합니다.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BITE - 한입 크기 기술 지식',
    description: '매일 한입 크기로 읽는 기술 블로그 큐레이션',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-svh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'BITE',
              alternateName: 'BITE - 한입 크기 기술 지식',
              url: 'https://bite-sized.xyz',
              description: '매일 한입 크기로 읽는 기술 블로그 큐레이션',
              inLanguage: 'ko',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://bite-sized.xyz/feed?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }).replace(/</g, '\\u003c'),
          }}
        />
        <Providers>
          <ResponsiveNav />
          <NavigationPadding>{children}</NavigationPadding>
        </Providers>
      </body>
    </html>
  );
}
