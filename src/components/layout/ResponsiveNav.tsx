'use client';

import { usePathname } from 'next/navigation';
import { BottomTabBar } from './BottomTabBar';
import { Sidebar } from './Sidebar';

const HIDDEN_PATHS = ['/auth', '/interest'];

export function ResponsiveNav() {
  const pathname = usePathname();

  const shouldHide = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  );

  if (shouldHide) return null;

  // Render both — CSS media queries in globals.css show exactly one at a
  // time based on viewport width + orientation. This avoids a JS-driven
  // layout flash and keeps iPad rotation reactive without React renders.
  return (
    <>
      <Sidebar />
      <BottomTabBar />
    </>
  );
}
