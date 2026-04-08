'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import { Icon } from '@/components/ui/Icon';
import BackButton from '@/components/layout/BackButton';
import { getJwtPayload } from '@/lib/jwt';

export default function MyDetailPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const showModal = !isLoggedIn;
  const userInfo = useMemo(
    () => (isLoggedIn ? getJwtPayload() : null),
    [isLoggedIn],
  );

  if (!isLoggedIn) {
    return (
      <MemberModal open={showModal} onClose={() => router.back()} />
    );
  }

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        <BackButton href="/my" />
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          내 정보
        </h1>
      </header>

      {/* Info rows */}
      <div className="px-4 py-5 border-b border-[var(--color-divider)]">
        <p className="text-sm text-[var(--color-gray3)] mb-1">이메일</p>
        <p className="text-base text-[var(--color-text)]">
          {userInfo?.email ?? '-'}
        </p>
      </div>
      <div className="px-4 py-5 border-b border-[var(--color-divider)]">
        <p className="text-sm text-[var(--color-gray3)] mb-1">이름</p>
        <p className="text-base text-[var(--color-text)]">
          {userInfo?.name ?? '-'}
        </p>
      </div>
      <div className="px-4 py-5 border-b border-[var(--color-divider)]">
        <p className="text-sm text-[var(--color-gray3)] mb-1">출생년도</p>
        <p className="text-base text-[var(--color-text)]">
          {userInfo?.birth ?? '-'}
        </p>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={() => router.push('/my/change-password')}
        className="flex items-center w-full px-4 py-5 border-b border-[var(--color-divider)] cursor-pointer text-left"
      >
        <span className="flex-1 text-base text-[var(--color-text)]">
          비밀번호 변경
        </span>
        <Icon name="arrow_right" size={18} />
      </button>

      <button
        type="button"
        onClick={() => router.push('/my/withdraw')}
        className="flex items-center w-full px-4 py-5 border-b border-[var(--color-divider)] cursor-pointer text-left"
      >
        <span className="flex-1 text-base text-[var(--color-error)]">
          회원 탈퇴
        </span>
        <Icon name="arrow_right" size={18} />
      </button>
    </main>
  );
}
