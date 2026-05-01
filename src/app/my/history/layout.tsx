import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '최근 본 글',
  robots: { index: false, follow: false },
};

export default function MyHistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
