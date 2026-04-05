'use client';

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
} from '@/components/icons/TabIcons';

interface Tab {
  href: string;
  label: string;
  DefaultIcon: React.ComponentType<{ size?: number }>;
  ActiveIcon: React.ComponentType<{ size?: number }>;
}

const tabs: Tab[] = [
  {
    href: '/feed',
    label: 'Home',
    DefaultIcon: HomeDefaultIcon,
    ActiveIcon: HomeFillIcon,
  },
  {
    href: '/bookmarks',
    label: 'Bookmark',
    DefaultIcon: CookieBoxDefaultIcon,
    ActiveIcon: CookieBoxFillIcon,
  },
  {
    href: '/my',
    label: 'My',
    DefaultIcon: MyDefaultIcon,
    ActiveIcon: MyFillIcon,
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollToTop } = useFeedScroll();

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
    <nav className="bottom-tab-bar" aria-label="주 내비게이션">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + '/');
        const IconComponent = isActive ? tab.ActiveIcon : tab.DefaultIcon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={handleClick(tab.href)}
            className="bottom-tab-item"
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            data-active={isActive}
          >
            <IconComponent size={26} />
          </Link>
        );
      })}
    </nav>
  );
}
