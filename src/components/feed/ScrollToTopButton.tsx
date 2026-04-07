'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScrollToTopButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  onClick,
  isRefreshing,
}) => {
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
      {isRefreshing ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="feed-floating-spinner"
        >
          <path
            d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 12V4M8 4L4 8M8 4L12 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {isRefreshing ? '새로고침 중' : '맨 위로'}
    </motion.button>
  );
};
