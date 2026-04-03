'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

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
      <div className="relative bg-[var(--color-bg)] rounded-2xl p-6 mx-4 w-full max-w-sm shadow-xl">
        <p className="text-center text-lg font-semibold text-[var(--color-text)] mb-6">
          로그인이 필요한 서비스입니다
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push('/auth/login')}>
            로그인
          </Button>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
