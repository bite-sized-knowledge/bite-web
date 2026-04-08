'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ArrowLeftIcon } from '@/components/icons/TabIcons';
import { changePassword, passwordMatch } from '@/lib/api/auth';
import { getJwtClaim } from '@/lib/jwt';

import { PASSWORD_REGEX, PASSWORD_HINT } from '@/lib/validation';

type Step = 'verify' | 'new';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const userEmail = useMemo(
    () => (isLoggedIn ? (getJwtClaim('email', '') || getJwtClaim('sub', '')) : ''),
    [isLoggedIn],
  );

  const [step, setStep] = useState<Step>('verify');
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

  const isNewPasswordValid = PASSWORD_REGEX.test(newPassword);

  const handleVerify = async () => {
    if (!currentPassword) return;
    setError('');
    setLoading(true);
    try {
      const ok = await passwordMatch(userEmail, currentPassword);
      if (ok) {
        setStep('new');
      } else {
        setError('현재 비밀번호가 일치하지 않습니다.');
      }
    } catch {
      setError('인증 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async () => {
    if (!isNewPasswordValid || newPassword !== confirmPassword) return;
    setError('');
    setLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result) {
        logout();
      } else {
        setError('비밀번호 변경에 실패했습니다.');
      }
    } catch {
      setError('비밀번호 변경 중 오류가 발생했습니다.');
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
        <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
        <button
          type="button"
          onClick={() => {
            if (step === 'new') {
              setStep('verify');
              setError('');
              return;
            }
            router.push('/my/detail');
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          aria-label="뒤로 가기"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          비밀번호 변경
        </h1>
      </header>

      <div className="px-4 py-6 flex flex-col gap-4">
        {step === 'verify' && (
          <>
            <Input
              label="현재 비밀번호"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={error}
            />
            <Button
              onClick={handleVerify}
              disabled={currentPassword.length === 0}
              loading={loading}
            >
              다음
            </Button>
          </>
        )}

        {step === 'new' && (
          <>
            <Input
              label="새 비밀번호"
              type="password"
              placeholder="8~16자, 영문 대/소문자, 숫자, 특수문자"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={
                newPassword.length > 0 && !isNewPasswordValid
                  ? PASSWORD_HINT
                  : ''
              }
            />
            <Input
              label="새 비밀번호 확인"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={
                confirmPassword.length > 0 && newPassword !== confirmPassword
                  ? '비밀번호가 일치하지 않습니다.'
                  : error
              }
            />
            <Button
              onClick={handleChange}
              disabled={!isNewPasswordValid || newPassword !== confirmPassword}
              loading={loading}
            >
              변경하기
            </Button>
          </>
        )}
      </div>
      </div>
    </main>
  );
}
