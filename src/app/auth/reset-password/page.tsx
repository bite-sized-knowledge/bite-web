'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/api/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const EMAIL_REGEX =
  /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/;

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = EMAIL_REGEX.test(email);
  const emailError =
    email.length > 0 && !isValid ? '이메일을 다시 확인해주세요.' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setError('');

    try {
      const status = await resetPassword(email);

      if (status) {
        setSent(true);
      } else {
        setError('이메일 전송에 실패했습니다.');
      }
    } catch {
      setError('서버에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen flex items-start justify-center pt-20">
        <div className="w-full max-w-md mx-auto p-6">
          <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
            이메일을 확인해주세요!
          </h1>
          <p className="text-[var(--color-text)] mt-4 mb-2">
            임시비밀번호를 전송했어요.
          </p>
          <p className="text-sm text-[var(--color-gray3)] mb-8">
            로그인 후 새 비밀번호로 변경해주세요.
            <br />
            *메일이 오지 않는 경우, 스팸함을 확인해보세요.
          </p>
          <Link href="/auth/login">
            <Button>로그인하러 가기</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-start justify-center pt-20">
      <div className="w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
          비밀번호 재설정
        </h1>
        <p className="text-[var(--color-gray3)] mb-8">
          가입하신 이메일로 임시 비밀번호를 보내드릴게요.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            autoComplete="email"
          />

          {error && (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          )}

          <Button type="submit" disabled={!isValid} loading={loading}>
            재설정 링크 보내기
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-[var(--color-gray3)] hover:underline"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
