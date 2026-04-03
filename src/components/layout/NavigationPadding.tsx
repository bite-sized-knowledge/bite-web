'use client';

import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const HIDDEN_PATHS = ['/auth', '/interest'];

export function NavigationPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDesktop } = useMediaQuery();

  const shouldHide = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (shouldHide) {
    return <>{children}</>;
  }

  return (
    <div
      style={
        isDesktop
          ? { paddingLeft: 80 }
          : { paddingBottom: 'var(--tabbar-height)' as string }
      }
    >
      {children}
    </div>
  );
}
