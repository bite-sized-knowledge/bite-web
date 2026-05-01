import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '관심사',
  robots: { index: false, follow: false },
};

export default function MyInterestsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
