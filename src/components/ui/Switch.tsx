'use client';

import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
}

export default function Switch({
  checked,
  onChange,
  activeLabel,
  inactiveLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked
          ? 'bg-[var(--color-main)]'
          : 'bg-[var(--color-gray3)]'
      }`}
    >
      {/* Labels inside track */}
      {activeLabel && (
        <span
          className={`absolute left-1.5 text-xs font-medium text-white transition-opacity ${
            checked ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {activeLabel}
        </span>
      )}
      {inactiveLabel && (
        <span
          className={`absolute right-1.5 text-xs font-medium text-white transition-opacity ${
            checked ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {inactiveLabel}
        </span>
      )}

      {/* Thumb */}
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
