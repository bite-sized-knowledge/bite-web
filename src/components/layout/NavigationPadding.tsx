'use client';

import { usePathname } from 'next/navigation';

const HIDDEN_PATHS = ['/auth', '/interest'];

export function NavigationPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldHide = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (shouldHide) {
    return <>{children}</>;
  }

  // Use CSS media query instead of JS to avoid hydration mismatch
  return (
    <div className="pb-[var(--tabbar-height)] lg:pb-0 lg:pl-[80px]">
      {children}
    </div>
  );
}
