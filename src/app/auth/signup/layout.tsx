import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회원가입',
  description: 'BITE 회원가입. 매일 한입 크기로 읽는 기술 블로그 큐레이션을 시작해보세요.',
  alternates: { canonical: 'https://bite-sized.xyz/auth/signup' },
  openGraph: {
    title: '회원가입 | BITE',
    description: '매일 한입 크기로 읽는 기술 블로그 큐레이션을 시작해보세요.',
    url: 'https://bite-sized.xyz/auth/signup',
  },
  robots: { index: false, follow: true },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
