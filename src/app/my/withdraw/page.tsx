'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import Button from '@/components/ui/Button';
import { withDraw, getAccessToken } from '@/lib/api/auth';
import { decodeJwt } from 'jose';

export default function WithdrawPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoggedIn]);

  const handleWithdraw = async () => {
    const confirmed = window.confirm(
      '정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      const decoded = decodeJwt(token) as { sub: string };
      const memberId = decoded.sub;

      const result = await withDraw(memberId);
      if (result) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        <button
          type="button"
          onClick={() => router.push('/my/detail')}
          className="text-[var(--color-text)] text-xl cursor-pointer"
          aria-label="뒤로 가기"
        >
          &larr;
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          회원 탈퇴
        </h1>
      </header>

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Warning */}
        <div className="rounded-lg bg-[var(--color-gray4)] p-4">
          <p className="text-base font-semibold text-[var(--color-text)] mb-2">
            회원 탈퇴 시 주의사항
          </p>
          <ul className="text-sm text-[var(--color-gray3)] space-y-1 list-disc list-inside">
            <li>탈퇴 후 계정 복구가 불가능합니다.</li>
            <li>저장한 북마크와 활동 내역이 모두 삭제됩니다.</li>
            <li>동일한 이메일로 재가입이 제한될 수 있습니다.</li>
          </ul>
        </div>

        <Button
          onClick={handleWithdraw}
          loading={loading}
          className="!bg-[var(--color-error)] !text-white hover:!opacity-90"
        >
          탈퇴하기
        </Button>
      </div>
    </main>
  );
}
