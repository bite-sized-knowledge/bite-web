import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입 완료',
  robots: { index: false, follow: false },
};

export default function SignUpWelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
