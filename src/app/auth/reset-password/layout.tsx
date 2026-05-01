import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '비밀번호 재설정',
  description: '가입하신 이메일로 인증 링크를 보내드립니다.',
  alternates: { canonical: 'https://bite-sized.xyz/auth/reset-password' },
  openGraph: {
    title: '비밀번호 재설정 | BITE',
    description: '가입하신 이메일로 인증 링크를 보내드립니다.',
    url: 'https://bite-sized.xyz/auth/reset-password',
  },
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
