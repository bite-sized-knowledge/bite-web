'use client';

import { usePathname } from 'next/navigation';

// Routes that render their own full-bleed chrome (auth/onboarding):
// we render the children without any nav-chrome offset at all.
const HIDDEN_PATHS = ['/auth', '/interest'];

// Routes that manage their own bottom/left nav offset internally
// (e.g. /feed uses 100svh + padding-bottom). The parent must not add
// another layer of padding or we get double offset → body scroll.
const SELF_MANAGED_PATHS = ['/feed'];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (path) => pathname === path || pathname.startsWith(path + '/'),
  );
}

export function NavigationPadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (matches(pathname, HIDDEN_PATHS) || matches(pathname, SELF_MANAGED_PATHS)) {
    return <>{children}</>;
  }

  return <div className="nav-padding">{children}</div>;
}
