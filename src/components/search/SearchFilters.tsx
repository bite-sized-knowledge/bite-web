'use client';

import { useEffect, useState } from 'react';
import { Interest, getInterests } from '@/lib/api/interest';

export type SearchLang = 'ko' | 'en' | null;

type Props = {
  categoryId: number | null;
  lang: SearchLang;
  onCategoryChange: (id: number | null) => void;
  onLangChange: (lang: SearchLang) => void;
};

const LANG_OPTIONS: Array<{ value: 'ko' | 'en'; label: string }> = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'EN' },
];

export function SearchFilters({
  categoryId,
  lang,
  onCategoryChange,
  onLangChange,
}: Props) {
  const [interests, setInterests] = useState<Interest[]>([]);

  useEffect(() => {
    let cancelled = false;
    getInterests().then((data) => {
      if (!cancelled) setInterests(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sticky top-[var(--header-height)] z-[5] bg-[var(--color-bg)] px-3 py-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LANG_OPTIONS.map((opt) => {
          const selected = lang === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onLangChange(selected ? null : opt.value)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
                selected
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-gray4)] text-[var(--color-text)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        {interests.length > 0 && (
          <div className="mx-1 h-4 w-px shrink-0 self-center bg-[var(--color-gray3)]/30" />
        )}

        {interests.map((i) => {
          const selected = categoryId === i.id;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => onCategoryChange(selected ? null : i.id)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
                selected
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-gray4)] text-[var(--color-text)]'
              }`}
            >
              {i.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
