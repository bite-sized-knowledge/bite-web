'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import { getAccessToken } from '@/lib/api/auth';
import { decodeJwt } from 'jose';

interface JwtPayload {
  sub: string;
  name: string;
  birth: number;
  email: string;
}

export default function MyDetailPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState<JwtPayload | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    const token = getAccessToken();
    if (token) {
      try {
        const decoded = decodeJwt(token) as JwtPayload;
        setUserInfo(decoded);
      } catch {
        // ignore
      }
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <MemberModal open={showModal} onClose={() => setShowModal(false)} />
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        <button
          type="button"
          onClick={() => router.push('/my')}
          className="text-[var(--color-text)] text-xl cursor-pointer"
          aria-label="뒤로 가기"
        >
          &larr;
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          내 정보
        </h1>
      </header>

      {/* Info rows */}
      <div className="px-4 py-5 border-b border-[var(--color-gray4)]">
        <p className="text-sm text-[var(--color-gray3)] mb-1">이메일</p>
        <p className="text-base text-[var(--color-text)]">
          {userInfo?.email ?? '-'}
        </p>
      </div>
      <div className="px-4 py-5 border-b border-[var(--color-gray4)]">
        <p className="text-sm text-[var(--color-gray3)] mb-1">이름</p>
        <p className="text-base text-[var(--color-text)]">
          {userInfo?.name ?? '-'}
        </p>
      </div>
      <div className="px-4 py-5 border-b border-[var(--color-gray4)]">
        <p className="text-sm text-[var(--color-gray3)] mb-1">출생년도</p>
        <p className="text-base text-[var(--color-text)]">
          {userInfo?.birth ?? '-'}
        </p>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={() => router.push('/my/change-password')}
        className="flex items-center w-full px-4 py-5 border-b border-[var(--color-gray4)] cursor-pointer text-left"
      >
        <span className="flex-1 text-base text-[var(--color-text)]">
          비밀번호 변경
        </span>
        <span className="text-[var(--color-gray3)] text-xl">&rarr;</span>
      </button>

      <button
        type="button"
        onClick={() => router.push('/my/withdraw')}
        className="flex items-center w-full px-4 py-5 border-b border-[var(--color-gray4)] cursor-pointer text-left"
      >
        <span className="flex-1 text-base text-[var(--color-error)]">
          회원 탈퇴
        </span>
        <span className="text-[var(--color-gray3)] text-xl">&rarr;</span>
      </button>
    </main>
  );
}
