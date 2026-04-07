'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AUTO_DISMISS_MS = 8000;

interface ResumeReadingButtonProps {
  onClick: () => void;
  onDismiss: () => void;
}

export const ResumeReadingButton: React.FC<ResumeReadingButtonProps> = ({
  onClick,
  onDismiss,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Auto-dismiss on mobile only
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) {
      timerRef.current = setTimeout(onDismiss, AUTO_DISMISS_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  return (
    <motion.button
      type="button"
      className="feed-floating-btn"
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 4V12M8 12L4 8M8 12L12 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      이어서 읽기
    </motion.button>
  );
};
