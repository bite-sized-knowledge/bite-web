'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/feed',
    label: 'Home',
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? 'var(--color-main)' : 'var(--color-gray3)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: '/bookmarks',
    label: 'Bookmark',
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? 'var(--color-main)' : 'none'}
        stroke={active ? 'var(--color-main)' : 'var(--color-gray3)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    ),
  },
  {
    href: '/my',
    label: 'My',
    icon: (active: boolean) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? 'var(--color-main)' : 'var(--color-gray3)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 80,
        background: 'var(--color-bg)',
        borderRight: '1px solid var(--color-gray4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 24,
        gap: 8,
        zIndex: 50,
      }}
    >
      {/* BITE logo */}
      <div
        style={{
          marginBottom: 24,
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--color-main)',
          letterSpacing: '-0.02em',
        }}
      >
        BITE
      </div>

      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 12,
              textDecoration: 'none',
              background: isActive ? 'var(--color-gray4)' : 'transparent',
              transition: 'background 0.15s ease',
            }}
            aria-label={item.label}
          >
            {item.icon(isActive)}
          </Link>
        );
      })}
    </nav>
  );
}
