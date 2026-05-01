import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '좋아요한 글',
  robots: { index: false, follow: false },
};

export default function MyLikedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
