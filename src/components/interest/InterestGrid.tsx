'use client';

import Image from 'next/image';
import type { Interest } from '@/lib/api/interest';

interface InterestGridProps {
  interests: Interest[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export default function InterestGrid({
  interests,
  selectedIds,
  onToggle,
}: InterestGridProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
      {interests.map((interest) => {
        const isSelected = selectedIds.includes(interest.id);
        return (
          <button
            key={interest.id}
            onClick={() => onToggle(interest.id)}
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
                  <Image
                    src="/images/check.png"
                    alt=""
                    width={40}
                    height={40}
                    aria-hidden
                  />
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
