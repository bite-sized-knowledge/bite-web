"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.error("[bite-web] route error:", error);
    }
  }, [error]);

  return (
    <main className="flex min-h-[calc(100svh-var(--header-height,0px)-var(--tabbar-height,0px))] flex-col items-center justify-center px-6 py-12 text-center">
      <div
        aria-hidden
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]/10 text-[28px]"
      >
        <span className="text-[var(--color-error)]">!</span>
      </div>
      <h1 className="mt-6 text-[20px] font-semibold text-[var(--color-text)]">
        잠시 문제가 생겼어요
      </h1>
      <p className="mt-2 max-w-[320px] text-[14px] text-[var(--color-gray3)]">
        잠깐의 일시적 오류일 수 있어요. 다시 시도해주세요.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[11px] text-[var(--color-gray3)]">
          ref: {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-main)] px-8 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        >
          다시 시도
        </button>
        <Link
          href="/feed"
          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)] px-8 text-[15px] font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          피드로 돌아가기
        </Link>
      </div>
    </main>
  );
}
