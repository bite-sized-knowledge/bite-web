'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { useTheme } from '@/lib/theme/provider';
import MemberModal from '@/components/auth/MemberModal';
import Switch from '@/components/ui/Switch';
import { getAccessToken } from '@/lib/api/auth';
import { decodeJwt } from 'jose';

export default function MyPage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
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
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4">
        <h1 className="text-xl font-bold text-[var(--color-text)]">MY</h1>
      </header>

      {/* Profile section */}
      <button
        type="button"
        onClick={() => router.push('/my/detail')}
        className="flex items-center gap-2 w-full px-4 py-5 border-b border-[var(--color-gray4)] cursor-pointer text-left"
      >
        <div className="w-12 h-12 rounded-full bg-[var(--color-gray4)] shrink-0" />
        <span className="flex-1 text-lg font-bold text-[var(--color-text)]">
          {userName}
        </span>
        <span className="text-[var(--color-gray3)] text-xl">&rarr;</span>
      </button>

      {/* History section */}
      <button
        type="button"
        onClick={() => router.push('/my/history')}
        className="flex items-center w-full px-4 py-5 border-b border-[var(--color-gray4)] cursor-pointer text-left"
      >
        <span className="flex-1 text-lg font-bold text-[var(--color-text)]">
          최근 본 글
        </span>
        <span className="text-[var(--color-gray3)] text-xl">&rarr;</span>
      </button>

      {/* Theme toggle section */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--color-gray4)]">
        <span className="text-lg font-bold text-[var(--color-text)]">
          테마 전환
        </span>
        <Switch
          checked={themeMode === 'light'}
          onChange={toggleTheme}
          activeLabel="Sun"
          inactiveLabel="Moon"
        />
      </div>

      {/* Logout */}
      <div className="px-4 py-5">
        <button
          type="button"
          onClick={logout}
          className="w-full h-12 rounded-lg border border-[var(--color-gray4)] text-[var(--color-text)] font-semibold cursor-pointer hover:bg-[var(--color-gray4)] transition-colors"
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
