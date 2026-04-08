'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFeedScroll } from '@/hooks/useFeedScroll';
import {
  HomeDefaultIcon,
  HomeFillIcon,
  CookieBoxDefaultIcon,
  CookieBoxFillIcon,
  MyDefaultIcon,
  MyFillIcon,
  SearchIcon,
} from '@/components/icons/TabIcons';

type NavIcon = React.ComponentType<{ size?: number }>;

interface NavItem {
  href: string;
  label: string;
  DefaultIcon: NavIcon;
  ActiveIcon: NavIcon;
}

const navItems: NavItem[] = [
  {
    href: '/feed',
    label: '홈',
    DefaultIcon: HomeDefaultIcon,
    ActiveIcon: HomeFillIcon,
  },
  {
    href: '/search',
    label: '검색',
    DefaultIcon: SearchIcon,
    ActiveIcon: SearchIcon,
  },
  {
    href: '/bookmarks',
    label: '북마크',
    DefaultIcon: CookieBoxDefaultIcon,
    ActiveIcon: CookieBoxFillIcon,
  },
  {
    href: '/my',
    label: '마이페이지',
    DefaultIcon: MyDefaultIcon,
    ActiveIcon: MyFillIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollToTop } = useFeedScroll();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (href: string) => (e: React.MouseEvent) => {
    if (href === '/feed' && (pathname === '/feed' || pathname.startsWith('/feed/'))) {
      e.preventDefault();
      scrollToTop();
      return;
    }
    e.preventDefault();
    router.push(href);
  };

  return (
    <nav
      className="sidebar-nav"
      aria-label="주 내비게이션"
      aria-expanded={isExpanded}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocus={() => setIsExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsExpanded(false);
        }
      }}
    >
      <Link href="/feed" className="sidebar-logo" aria-label="BITE 홈">
        <Image
          src="/logo.png"
          alt="BITE"
          width={48}
          height={48}
          priority
          style={{ width: 48, height: 48 }}
        />
        <span className="sidebar-logo-text" aria-hidden>BITE</span>
      </Link>

      <div className="sidebar-items">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const IconComponent = isActive ? item.ActiveIcon : item.DefaultIcon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick(item.href)}
              className="sidebar-item"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              data-active={isActive}
            >
              <IconComponent size={26} />
              <span className="sidebar-label" aria-hidden>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
