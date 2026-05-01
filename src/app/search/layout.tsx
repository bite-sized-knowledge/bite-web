import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '검색',
  description: '키워드 또는 자연스러운 문장으로 BITE의 기술 블로그 글을 검색해보세요.',
  alternates: { canonical: 'https://bite-sized.xyz/search' },
  openGraph: {
    title: '검색 | BITE',
    description: '키워드 또는 자연스러운 문장으로 BITE의 기술 블로그 글을 검색해보세요.',
    url: 'https://bite-sized.xyz/search',
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
