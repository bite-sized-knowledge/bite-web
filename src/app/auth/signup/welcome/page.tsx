'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const REDIRECT_DELAY_MS = 1500;
const NEXT_PATH = '/interest';

export default function SignUpWelcomePage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push(NEXT_PATH);
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-[var(--color-bg)] px-6 text-center">
      <Image
        src="/images/welcome.png"
        alt=""
        width={240}
        height={240}
        priority
        aria-hidden
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          환영합니다!
        </h1>
        <p className="text-sm text-[var(--color-gray3)]">
          곧 취향에 맞는 글을 준비해드릴게요.
        </p>
      </div>
    </main>
  );
}
