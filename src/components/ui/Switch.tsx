'use client';

import { ReactNode } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  activeLabel?: string;
  inactiveLabel?: string;
  activeIcon?: ReactNode;
  inactiveIcon?: ReactNode;
}

export default function Switch({
  checked,
  onChange,
  activeLabel,
  inactiveLabel,
  activeIcon,
  inactiveIcon,
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
      {/* Track indicators (text labels and/or icons) */}
      {(activeLabel || activeIcon) && (
        <span
          className={`absolute left-1.5 flex items-center text-xs font-medium text-white transition-opacity ${
            checked ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {activeIcon ?? activeLabel}
        </span>
      )}
      {(inactiveLabel || inactiveIcon) && (
        <span
          className={`absolute right-1.5 flex items-center text-xs font-medium text-white transition-opacity ${
            checked ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {inactiveIcon ?? inactiveLabel}
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
