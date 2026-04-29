import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100svh-var(--header-height,0px)-var(--tabbar-height,0px))] flex-col items-center justify-center px-6 py-12 text-center">
      <p className="text-[64px] font-bold leading-none text-[var(--color-main)]">404</p>
      <h1 className="mt-6 text-[20px] font-semibold text-[var(--color-text)]">
        찾을 수 없는 페이지예요
      </h1>
      <p className="mt-2 text-[14px] text-[var(--color-gray3)]">
        주소가 바뀌었거나 더 이상 존재하지 않는 글일 수 있어요.
      </p>
      <Link
        href="/feed"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-main)] px-8 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
      >
        피드로 돌아가기
      </Link>
    </main>
  );
}
