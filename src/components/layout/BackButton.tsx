'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/icons/TabIcons';

interface BackButtonProps {
  href?: string;
}

export default function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="뒤로 가기"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
    >
      <ArrowLeftIcon size={20} />
    </button>
  );
}
