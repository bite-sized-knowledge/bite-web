'use client';

import { InputHTMLAttributes, useState } from 'react';
import { Icon } from './Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  type,
  ...props
}: InputProps) {
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  const effectiveType = isPassword ? (visible ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={effectiveType}
          className={`w-full h-12 ${
            isPassword ? 'pr-12' : 'pr-4'
          } pl-4 rounded-lg border text-[var(--color-text)] bg-transparent placeholder:text-[var(--color-gray3)] outline-none transition-colors ${
            error
              ? 'border-[var(--color-error)]'
              : 'border-[var(--color-border)] focus:border-[var(--color-main)]'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-hover)]"
            tabIndex={-1}
          >
            <Icon name={visible ? 'eye' : 'blind'} size={20} />
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
      )}
    </div>
  );
}
