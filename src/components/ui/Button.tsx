'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export default function Button({
  children,
  loading = false,
  disabled,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    'w-full h-12 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer';

  const variants = {
    primary: isDisabled
      ? 'bg-[var(--color-gray4)] text-[var(--color-gray3)] cursor-not-allowed'
      : 'bg-[var(--color-main)] text-white hover:opacity-90',
    outline: isDisabled
      ? 'border border-[var(--color-gray4)] text-[var(--color-gray3)] cursor-not-allowed'
      : 'border border-[var(--color-gray4)] text-[var(--color-text)] hover:bg-[var(--color-gray4)]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
