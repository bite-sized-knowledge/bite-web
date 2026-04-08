'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import { Icon } from '@/components/ui/Icon';
import { getJwtPayload } from '@/lib/jwt';

export default function MyPage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
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
      <div className="my-page-layout">
        <div className="my-page-container">
          {/* Header */}
          <header className="flex items-center h-[var(--header-height)] px-4">
            <h1 className="text-xl font-bold text-[var(--color-text)]">MY</h1>
          </header>

          {/* Profile section */}
          <button
            type="button"
            onClick={() => router.push('/my/detail')}
            className="my-profile-section flex items-center gap-4 w-full px-4 py-6 border-b border-[var(--color-divider)] cursor-pointer text-left"
          >
            <div className="relative my-avatar shrink-0 overflow-hidden rounded-full bg-[var(--color-gray4)]">
              <Image
                src="/images/profileImage.png"
                alt=""
                fill
                sizes="64px"
                className="object-cover"
                aria-hidden
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-[var(--color-text)] truncate">
                {userInfo?.name ?? ''}
              </p>
              <p className="text-sm text-[var(--color-gray3)] truncate mt-0.5">
                {userInfo?.email ?? ''}
              </p>
            </div>
            <Icon name="arrow_right" size={18} />
          </button>

          {/* Menu group */}
          <div className="my-menu-group">
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

            <button
              type="button"
              onClick={() => router.push('/my/liked')}
              className="flex items-center w-full px-4 py-5 border-b border-[var(--color-divider)] cursor-pointer text-left"
            >
              <span className="flex-1 text-lg font-bold text-[var(--color-text)]">
                좋아요 한 글
              </span>
              <Icon name="arrow_right" size={18} />
            </button>

            <button
              type="button"
              onClick={() => router.push('/my/interests')}
              className="flex items-center w-full px-4 py-5 border-b border-[var(--color-divider)] cursor-pointer text-left"
            >
              <span className="flex-1 text-lg font-bold text-[var(--color-text)]">
                관심사 수정
              </span>
              <Icon name="arrow_right" size={18} />
            </button>
          </div>

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
        </div>

        {/* Desktop aside — branding */}
        <aside className="my-page-aside">
          <Image
            src="/logo.png"
            alt="BITE"
            width={88}
            height={88}
            className="rounded-2xl"
          />
          <div>
            <p className="text-2xl font-bold text-[var(--color-text)]">BITE</p>
            <p className="text-base text-[var(--color-gray3)] mt-1">
              바쁜 하루, 한입 크기로 읽는 IT 트렌드
            </p>
          </div>
          <p className="text-sm text-[var(--color-gray3)] leading-relaxed">
            엄선된 기술 블로그 글을 핵심만 담아 전달해요.
            <br />
            관심사에 맞는 콘텐츠를 발견하고, 나만의 피드를 만들어보세요.
          </p>
        </aside>
      </div>
    </main>
  );
}
