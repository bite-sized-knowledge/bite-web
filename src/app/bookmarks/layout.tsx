import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '북마크',
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
