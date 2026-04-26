'use client';

type Props = {
  suggestions: string[];
  onSelect: (q: string) => void;
};

function MagnifyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function SearchSuggestions({ suggestions, onSelect }: Props) {
  if (suggestions.length === 0) return null;
  return (
    <div
      role="listbox"
      className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-[var(--color-bg)] shadow-lg ring-1 ring-[var(--color-gray4)]"
    >
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          role="option"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(s);
          }}
          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
        >
          <span className="text-[var(--color-gray3)]">
            <MagnifyIcon />
          </span>
          <span className="flex-1 truncate">{s}</span>
        </button>
      ))}
    </div>
  );
}
