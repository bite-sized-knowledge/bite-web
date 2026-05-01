import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '비밀번호 변경',
  robots: { index: false, follow: false },
};

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
