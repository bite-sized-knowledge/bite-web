'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInterests, getGuestAccount } from '@/lib/api/interest';
import Button from '@/components/ui/Button';

interface Interest {
  id: number;
  name: string;
  image: string;
}

export default function InterestPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const data = await getInterests();
        if (data) {
          setInterests(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchInterests();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleStart = async () => {
    if (selectedIds.length < 1 || submitting) return;

    setSubmitting(true);
    try {
      const success = await getGuestAccount(selectedIds);
      if (success) {
        localStorage.setItem('interestIds', JSON.stringify(selectedIds));
        router.push('/feed');
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-[var(--color-main)]"
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
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">
          안녕하세요!
        </h1>
        <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
          관심있는 주제는 무엇인가요?
        </h2>
        <p className="text-sm text-[var(--color-gray3)] mb-6">
          *중복 선택 할 수 있어요.
        </p>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {interests.map((interest) => {
            const isSelected = selectedIds.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleSelect(interest.id)}
                className="relative aspect-square rounded-lg bg-[var(--color-gray4)] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <span className="absolute top-2 left-2 text-sm font-semibold text-[var(--color-text)] z-10">
                  {interest.name}
                </span>

                {interest.image && (
                  <img
                    src={interest.image}
                    alt={interest.name}
                    className="absolute bottom-2 right-2 w-[40%] h-[40%] object-contain"
                  />
                )}

                {isSelected && (
                  <>
                    <div className="absolute inset-0 bg-[rgba(255,110,28,0.9)] rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 w-full max-w-2xl mx-auto p-6 bg-[var(--color-bg)]">
        <Link
          href="/auth/login"
          className="block text-center text-sm text-[var(--color-gray3)] underline mb-3"
        >
          이미 계정이 있나요? 로그인
        </Link>
        <Button
          onClick={handleStart}
          disabled={selectedIds.length < 1}
          loading={submitting}
        >
          시작하기
        </Button>
      </div>
    </main>
  );
}
