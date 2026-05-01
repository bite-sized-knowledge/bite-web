import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '내 정보',
  robots: { index: false, follow: false },
};

export default function MyDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
