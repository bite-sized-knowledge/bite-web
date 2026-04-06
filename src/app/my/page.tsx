'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import { Icon } from '@/components/ui/Icon';
import { getAccessToken } from '@/lib/api/auth';
import { decodeJwt } from 'jose';

export default function MyPage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const showModal = !isLoggedIn;
  const userName = useMemo(() => {
    if (!isLoggedIn) return '';
    const token = getAccessToken();
    if (token) {
      try {
        const decoded = decodeJwt(token) as { name?: string };
        return decoded.name ?? '';
      } catch {
        // ignore
      }
    }
    return '';
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <MemberModal open={showModal} onClose={() => router.back()} />
    );
  }

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4">
        <h1 className="text-xl font-bold text-[var(--color-text)]">MY</h1>
      </header>

      {/* Profile section */}
      <button
        type="button"
        onClick={() => router.push('/my/detail')}
        className="flex items-center gap-3 w-full px-4 py-5 border-b border-[var(--color-divider)] cursor-pointer text-left"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--color-gray4)]">
          <Image
            src="/images/profileImage.png"
            alt=""
            fill
            sizes="48px"
            className="object-cover"
            aria-hidden
          />
        </div>
        <span className="flex-1 text-lg font-bold text-[var(--color-text)]">
          {userName}
        </span>
        <Icon name="arrow_right" size={18} />
      </button>

      {/* History section */}
      <button
        type="button"
        onClick={() => router.push('/my/history')}
        className="flex items-center w-full px-4 py-5 border-b border-[var(--color-divider)] cursor-pointer text-left"
      >
        <span className="flex-1 text-lg font-bold text-[var(--color-text)]">
          최근 본 글
        </span>
        <Icon name="arrow_right" size={18} />
      </button>

      {/* Logout */}
      <div className="px-4 py-5">
        <button
          type="button"
          onClick={logout}
          className="w-full h-12 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-semibold cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
