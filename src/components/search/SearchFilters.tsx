'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Interest, getInterests } from '@/lib/api/interest';

export type SearchLang = 'ko' | 'en' | null;

const DRAG_CLOSE_THRESHOLD = 80;
const MOBILE_MEDIA_QUERY = '(max-width: 819px), (orientation: portrait)';

const LANG_OPTIONS: Array<{ value: 'ko' | 'en'; label: string }> = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'EN' },
];

const CHIP_BASE =
  'shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors';
const CHIP_SELECTED = `${CHIP_BASE} bg-[var(--color-main)] text-white`;
const CHIP_UNSELECTED = `${CHIP_BASE} bg-[var(--color-gray4)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]`;

type Props = {
  open: boolean;
  onClose: () => void;
  categoryId: number | null;
  lang: SearchLang;
  onCategoryChange: (id: number | null) => void;
  onLangChange: (lang: SearchLang) => void;
};

function PanelBody({
  interests,
  categoryId,
  lang,
  onCategoryChange,
  onLangChange,
  onReset,
  onClose,
  resetDisabled,
}: {
  interests: Interest[];
  categoryId: number | null;
  lang: SearchLang;
  onCategoryChange: (id: number | null) => void;
  onLangChange: (lang: SearchLang) => void;
  onReset: () => void;
  onClose: () => void;
  resetDisabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <section>
        <h3 className="mb-2 text-xs font-semibold text-[var(--color-gray3)]">언어</h3>
        <div className="flex flex-wrap gap-2">
          {LANG_OPTIONS.map((opt) => {
            const selected = lang === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onLangChange(selected ? null : opt.value)}
                aria-pressed={selected}
                className={selected ? CHIP_SELECTED : CHIP_UNSELECTED}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {interests.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold text-[var(--color-gray3)]">카테고리</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((i) => {
              const selected = categoryId === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => onCategoryChange(selected ? null : i.id)}
                  aria-pressed={selected}
                  className={selected ? CHIP_SELECTED : CHIP_UNSELECTED}
                >
                  {i.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between border-t border-[var(--color-divider)] pt-3">
        <button
          type="button"
          onClick={onReset}
          disabled={resetDisabled}
          className="text-xs text-[var(--color-gray3)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-[var(--color-main)] px-4 py-1.5 text-xs font-semibold text-white"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export function SearchFilters({
  open,
  onClose,
  categoryId,
  lang,
  onCategoryChange,
  onLangChange,
}: Props) {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 패널이 처음 열릴 때까지 카테고리 fetch를 미룸
  useEffect(() => {
    if (!open || interests.length > 0) return;
    let cancelled = false;
    getInterests().then((data) => {
      if (!cancelled) setInterests(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [open, interests.length]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Esc 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // PC popover 외부 클릭 닫기 (트리거 버튼 클릭은 무시 — 부모의 토글 동작과 race 방지)
  useEffect(() => {
    if (!open || isMobile) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-filter-trigger]')) return;
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, isMobile, onClose]);

  // 모바일 시트가 열려 있을 때 body 스크롤 잠금
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  const activeCount =
    (categoryId !== null ? 1 : 0) + (lang !== null ? 1 : 0);

  const handleReset = () => {
    onLangChange(null);
    onCategoryChange(null);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD) onClose();
  };

  if (isMobile) {
    if (typeof window === 'undefined') return null;
    return createPortal(
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onClose}
            />
            <motion.div
              className="relative w-full max-w-[640px] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--color-card-bg)] shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={handleDragEnd}
            >
              <div className="sticky top-0 z-10 flex justify-center rounded-t-2xl bg-[var(--color-card-bg)] pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-[var(--color-gray3)]" />
              </div>
              <PanelBody
                interests={interests}
                categoryId={categoryId}
                lang={lang}
                onCategoryChange={onCategoryChange}
                onLangChange={onLangChange}
                onReset={handleReset}
                onClose={onClose}
                resetDisabled={activeCount === 0}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body,
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          role="dialog"
          aria-label="검색 필터"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
          className="absolute right-0 top-full z-[20] mt-2 w-[320px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-xl"
        >
          <PanelBody
            interests={interests}
            categoryId={categoryId}
            lang={lang}
            onCategoryChange={onCategoryChange}
            onLangChange={onLangChange}
            onReset={handleReset}
            onClose={onClose}
            resetDisabled={activeCount === 0}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
