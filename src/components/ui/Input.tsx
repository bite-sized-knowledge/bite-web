'use client';

import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full h-12 px-4 rounded-lg border text-[var(--color-text)] bg-transparent placeholder:text-[var(--color-gray3)] outline-none transition-colors ${
          error
            ? 'border-[var(--color-error)]'
            : 'border-[var(--color-gray4)] focus:border-[var(--color-main)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
