'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import MemberModal from '@/components/auth/MemberModal';
import { Icon } from '@/components/ui/Icon';
import BackButton from '@/components/layout/BackButton';
import { getJwtPayload } from '@/lib/jwt';
import { updateProfile } from '@/lib/api/auth';

type EditField = 'name' | 'birth' | null;

export default function MyDetailPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const showModal = !isLoggedIn;

  const [profileVersion, setProfileVersion] = useState(0);
  const userInfo = useMemo(
    () => (isLoggedIn ? getJwtPayload() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoggedIn, profileVersion],
  );

  const [editField, setEditField] = useState<EditField>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = useCallback((field: 'name' | 'birth') => {
    setEditField(field);
    setError('');
    if (field === 'name') {
      setEditValue(userInfo?.name ?? '');
    } else {
      setEditValue(String(userInfo?.birth ?? ''));
    }
  }, [userInfo]);

  const cancelEdit = useCallback(() => {
    setEditField(null);
    setEditValue('');
    setError('');
  }, []);

  const saveName = useCallback(async () => {
    const name = editValue.trim();
    if (!name) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (name === userInfo?.name) {
      cancelEdit();
      return;
    }
    setSaving(true);
    setError('');
    try {
      const ok = await updateProfile({ name });
      if (ok) {
        setProfileVersion((v) => v + 1);
        setEditField(null);
      } else {
        setError('변경에 실패했습니다.');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }, [editValue, userInfo?.name, cancelEdit]);

  const saveBirth = useCallback(async () => {
    const year = parseInt(editValue, 10);
    if (!editValue || isNaN(year)) {
      setError('출생년도를 입력해주세요.');
      return;
    }
    const currentYear = new Date().getFullYear();
    if (year < 1920 || year > currentYear - 10) {
      setError(`1920 ~ ${currentYear - 10} 사이의 값을 입력해주세요.`);
      return;
    }
    if (year === userInfo?.birth) {
      cancelEdit();
      return;
    }
    setSaving(true);
    setError('');
    try {
      const ok = await updateProfile({ birth: year });
      if (ok) {
        setProfileVersion((v) => v + 1);
        setEditField(null);
      } else {
        setError('변경에 실패했습니다.');
      }
    } catch {
      setError('오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }, [editValue, userInfo?.birth, cancelEdit]);

  if (!isLoggedIn) {
    return (
      <MemberModal open={showModal} onClose={() => router.back()} />
    );
  }

  return (
    <main className="min-h-svh bg-[var(--color-bg)]">
      <div className="my-page-container">
        {/* Header */}
        <header className="flex items-center h-[var(--header-height)] px-4 gap-3">
          <BackButton href="/my" />
          <h1 className="text-xl font-bold text-[var(--color-text)]">
            내 정보
          </h1>
        </header>

        {/* Profile info card */}
        <div className="my-menu-group">
          {/* Email (read-only) */}
          <div className="px-4 py-5 border-b border-[var(--color-divider)]">
            <p className="text-sm text-[var(--color-gray3)] mb-1">이메일</p>
            <p className="text-base text-[var(--color-text)]">
              {userInfo?.email ?? '-'}
            </p>
          </div>

          {/* Name */}
          <div className="px-4 py-5 border-b border-[var(--color-divider)]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-[var(--color-gray3)]">이름</p>
              {editField !== 'name' && (
                <button
                  type="button"
                  onClick={() => startEdit('name')}
                  className="text-sm text-[var(--color-main)] font-medium cursor-pointer"
                >
                  수정
                </button>
              )}
            </div>
            {editField === 'name' ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  maxLength={20}
                  autoFocus
                  className="w-full h-10 px-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] bg-transparent outline-none focus:border-[var(--color-main)] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                {error && (
                  <p className="text-sm text-[var(--color-error)]">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 h-9 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text)] font-medium cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={saveName}
                    disabled={saving}
                    className="flex-1 h-9 rounded-lg bg-[var(--color-main)] text-sm text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-base text-[var(--color-text)]">
                {userInfo?.name ?? '-'}
              </p>
            )}
          </div>

          {/* Birth year */}
          <div className="px-4 py-5 border-b border-[var(--color-divider)]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-[var(--color-gray3)]">출생년도</p>
              {editField !== 'birth' && (
                <button
                  type="button"
                  onClick={() => startEdit('birth')}
                  className="text-sm text-[var(--color-main)] font-medium cursor-pointer"
                >
                  수정
                </button>
              )}
            </div>
            {editField === 'birth' ? (
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  min={1920}
                  max={new Date().getFullYear() - 10}
                  autoFocus
                  className="w-full h-10 px-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] bg-transparent outline-none focus:border-[var(--color-main)] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveBirth();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
                {error && (
                  <p className="text-sm text-[var(--color-error)]">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 h-9 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text)] font-medium cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={saveBirth}
                    disabled={saving}
                    className="flex-1 h-9 rounded-lg bg-[var(--color-main)] text-sm text-white font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-base text-[var(--color-text)]">
                {userInfo?.birth ?? '-'}
              </p>
            )}
          </div>
        </div>

        {/* Actions card */}
        <div className="my-menu-group">
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
        </div>
      </div>
    </main>
  );
}
