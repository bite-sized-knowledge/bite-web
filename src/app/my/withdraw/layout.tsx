import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원 탈퇴',
  robots: { index: false, follow: false },
};

export default function WithdrawLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
