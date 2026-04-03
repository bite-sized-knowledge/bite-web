import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MY',
};

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
