'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import BackButton from '@/components/layout/BackButton';
import { withDraw } from '@/lib/api/auth';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import { getJwtClaim } from '@/lib/jwt';

const CONFIRMATIONS: string[] = [
  '탈퇴 후 계정 복구가 불가능합니다',
  '저장한 북마크와 활동 내역이 모두 삭제됩니다',
  '동일한 이메일로 재가입이 제한될 수 있습니다',
];

export default function WithdrawPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(
    CONFIRMATIONS.map(() => false),
  );

  const allConfirmed = checks.every(Boolean);

  const toggleCheck = (index: number) => {
    setChecks((prev) => prev.map((c, i) => (i === index ? !c : c)));
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoggedIn]);

  const handleWithdraw = async () => {
    if (!allConfirmed) return;

    setLoading(true);
    try {
      const memberId = getJwtClaim('sub', '');
      if (!memberId) return;

      const result = await withDraw(memberId);
      if (result) {
        // Clear httpOnly refresh token cookie
        try {
          await fetch(`${getApiBaseUrl()}/v1/auth/logout`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch { /* ignore */ }
        localStorage.removeItem('accessToken');
        router.push('/auth/login');
      } else {
        alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <MemberModal open={showModal} onClose={() => setShowModal(false)} />
    );
  }

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
      <div className="my-page-container">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        <BackButton href="/my/detail" />
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          회원 탈퇴
        </h1>
      </header>

      <div className="px-4 py-6 flex flex-col gap-6">
        <div>
          <p className="mb-4 text-base font-semibold text-[var(--color-text)]">
            회원 탈퇴 시 주의사항
          </p>
          <ul className="flex flex-col gap-3">
            {CONFIRMATIONS.map((text, i) => (
              <li key={i}>
                <Checkbox
                  checked={checks[i]}
                  onChange={() => toggleCheck(i)}
                  label={text}
                />
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleWithdraw}
          loading={loading}
          disabled={!allConfirmed}
          className="!bg-[var(--color-error)] !text-white hover:!opacity-90 disabled:!bg-[var(--color-disabled-bg)] disabled:!text-[var(--color-disabled-text)]"
        >
          탈퇴하기
        </Button>
      </div>
      </div>
    </main>
  );
}
