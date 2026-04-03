'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { changePassword } from '@/lib/api/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
    }
  }, [isLoggedIn]);

  const handleSubmit = async () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 항목을 입력해주세요');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다');
      return;
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result) {
        alert('비밀번호가 변경되었습니다');
        router.push('/my/detail');
      } else {
        setError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
      }
    } catch {
      setError('비밀번호 변경 중 오류가 발생했습니다');
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
          비밀번호 변경
        </h1>
      </header>

      <div className="px-4 py-6 flex flex-col gap-4">
        <Input
          label="현재 비밀번호"
          type="password"
          placeholder="현재 비밀번호를 입력하세요"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="새 비밀번호"
          type="password"
          placeholder="새 비밀번호를 입력하세요"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="새 비밀번호 확인"
          type="password"
          placeholder="새 비밀번호를 다시 입력하세요"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={error}
        />

        <div className="mt-4">
          <Button onClick={handleSubmit} loading={loading}>
            변경하기
          </Button>
        </div>
      </div>
    </main>
  );
}
