'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/provider';
import OAuthButtons from '@/components/auth/OAuthButtons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { setLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        setLoggedIn(true);
        router.push('/feed');
      } else {
        setError('이메일 또는 비밀번호가 틀립니다.');
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-start justify-center pt-20">
      <div className="w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
          로그인
        </h1>
        <p className="text-[var(--color-gray3)] mb-8">
          로그인하고 더 유용한 지식을 얻어보세요!
        </p>

        <OAuthButtons />

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[var(--color-gray4)]" />
          <span className="text-sm text-[var(--color-gray3)]">또는</span>
          <div className="flex-1 h-px bg-[var(--color-gray4)]" />
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          )}

          <Button type="submit" disabled={!isFormValid} loading={loading}>
            로그인
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-[var(--color-gray3)]">
          <Link href="/auth/signup" className="hover:underline">
            회원가입
          </Link>
          <span>|</span>
          <Link href="/auth/reset-password" className="hover:underline">
            비밀번호를 잊어버렸어요
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/interest"
            className="text-sm text-[var(--color-gray3)] underline"
          >
            비회원으로 둘러보기
          </Link>
        </div>
      </div>
    </main>
  );
}
