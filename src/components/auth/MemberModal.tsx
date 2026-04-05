'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MemberModal({ open, onClose }: MemberModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-[var(--color-bg)] p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)]"
        >
          <Icon name="close" size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 pt-4">
          <Image
            src="/images/login.png"
            alt=""
            width={160}
            height={160}
            style={{ width: 160, height: 'auto' }}
            aria-hidden
          />
          <p className="text-center text-lg font-semibold text-[var(--color-text)]">
            로그인하고 더 많은 기능을
            <br />
            이용해보세요!
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => router.push('/auth/login')}>로그인</Button>
        </div>
      </div>
    </div>
  );
}
