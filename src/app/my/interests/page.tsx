'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getInterests,
  getMyInterests,
  saveInterests,
} from '@/lib/api/interest';
import type { Interest } from '@/lib/api/interest';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import InterestGrid from '@/components/interest/InterestGrid';

export default function EditInterestsPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [all, mine] = await Promise.all([
          getInterests(),
          getMyInterests(),
        ]);
        if (all) setInterests(all);
        if (mine) setSelectedIds(mine);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (selectedIds.length < 1 || submitting) return;
    setSubmitting(true);
    try {
      const ok = await saveInterests(selectedIds);
      if (ok) {
        localStorage.setItem('interestIds', JSON.stringify(selectedIds));
        router.back();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-svh flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-[var(--color-main)]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </main>
    );
  }

  return (
    <main className="min-h-svh flex flex-col bg-[var(--color-bg)]">
      <header className="flex items-center h-[var(--header-height)] px-4">
        <button type="button" onClick={() => router.back()} className="mr-3 cursor-pointer">
          <Icon name="arrow_left" size={22} />
        </button>
        <h1 className="text-xl font-bold text-[var(--color-text)]">관심사 수정</h1>
      </header>

      <div className="flex-1 w-full max-w-2xl mx-auto p-6">
        <p className="text-sm text-[var(--color-gray3)] mb-6">
          *중복 선택 할 수 있어요.
        </p>
        <InterestGrid
          interests={interests}
          selectedIds={selectedIds}
          onToggle={toggleSelect}
        />
      </div>

      <div className="sticky bottom-0 w-full max-w-2xl mx-auto p-6 bg-[var(--color-bg)]">
        <Button
          onClick={handleSave}
          disabled={selectedIds.length < 1}
          loading={submitting}
        >
          저장
        </Button>
      </div>
    </main>
  );
}
