'use client';

import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { BottomTabBar } from './BottomTabBar';
import { Sidebar } from './Sidebar';

const HIDDEN_PATHS = ['/auth', '/interest'];

export function ResponsiveNav() {
  const pathname = usePathname();
  const { isDesktop } = useMediaQuery();

  const shouldHide = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (shouldHide) return null;

  return isDesktop ? <Sidebar /> : <BottomTabBar />;
}
