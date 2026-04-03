import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '피드',
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
