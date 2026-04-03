import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ResponsiveNav } from "@/components/layout/ResponsiveNav";
import { NavigationPadding } from "@/components/layout/NavigationPadding";

export const metadata: Metadata = {
  title: {
    default: 'BITE - 한입 크기 기술 지식',
    template: '%s | BITE',
  },
  description: '매일 한입 크기로 읽는 기술 블로그 큐레이션',
  keywords: ['기술 블로그', 'tech blog', '개발', '프로그래밍', 'BITE'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://bite-sized.xyz',
    siteName: 'BITE',
    title: 'BITE - 한입 크기 기술 지식',
    description: '매일 한입 크기로 읽는 기술 블로그 큐레이션',
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
      <body className="min-h-screen">
        <Providers>
          <ResponsiveNav />
          <NavigationPadding>{children}</NavigationPadding>
        </Providers>
      </body>
    </html>
  );
}
