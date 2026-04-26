'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

const DRAG_CLOSE_THRESHOLD = 80;

interface LoginPromptSheetProps {
  open: boolean;
  reason: string;
  onLogin: () => void;
  onClose: () => void;
}

function SheetContent({
  reason,
  onLogin,
  onClose,
}: {
  reason: string;
  onLogin: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-[640px] rounded-t-2xl bg-[var(--color-card-bg)] shadow-2xl flex flex-col"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
        role="dialog"
        aria-modal="true"
        aria-label="로그인이 필요해요"
      >
        <div className="flex justify-center pt-3 pb-2 rounded-t-2xl">
          <div className="h-1 w-10 rounded-full bg-[var(--color-gray3)]" />
        </div>

        <div className="px-5 pb-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2 pt-2">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              로그인이 필요해요
            </h2>
            <p className="text-sm text-[var(--color-gray3)]">
              {reason}을(를) 누르려면 로그인해주세요. 관심 있는 글에 반응을 남기고
              나만의 피드를 만들어보세요.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onLogin}
              className="w-full rounded-xl py-3 text-sm font-semibold bg-[var(--color-main)] text-white transition-opacity hover:opacity-90"
            >
              로그인
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl py-3 text-sm font-medium text-[var(--color-gray3)] hover:text-[var(--color-text)] transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function LoginPromptSheet({
  open,
  reason,
  onLogin,
  onClose,
}: LoginPromptSheetProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <SheetContent
          key="login-prompt"
          reason={reason}
          onLogin={onLogin}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
