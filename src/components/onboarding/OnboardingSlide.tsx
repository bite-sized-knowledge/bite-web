'use client';

import { type ReactNode } from 'react';

interface OnboardingSlideProps {
  illustration: ReactNode;
  title: string;
  description: string;
}

export function OnboardingSlide({
  illustration,
  title,
  description,
}: OnboardingSlideProps) {
  return (
    <div className="flex flex-col items-center gap-5 px-6 pb-4 pt-10">
      <div className="flex h-36 w-36 items-center justify-center">
        {illustration}
      </div>
      <h2 className="text-xl font-semibold text-[var(--color-text)]">
        {title}
      </h2>
      <p className="whitespace-pre-line text-center text-sm leading-relaxed text-[var(--color-gray3)]">
        {description}
      </p>
    </div>
  );
}
