'use client';

import { Icon } from './Icon';

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
}: CheckboxProps) {
  return (
    <label
      className={`flex items-start gap-3 ${
        disabled ? 'opacity-50' : 'cursor-pointer'
      }`}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        aria-checked={checked}
        role="checkbox"
        disabled={disabled}
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center"
      >
        <Icon name={checked ? 'box_checked' : 'box'} size={22} />
      </button>
      {label && (
        <span className="text-sm text-[var(--color-text)] leading-6">
          {label}
        </span>
      )}
    </label>
  );
}
