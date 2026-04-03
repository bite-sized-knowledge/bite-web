'use client';

import { useRouter } from 'next/navigation';

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export function CustomHeader({ title, showBackButton = false }: CustomHeaderProps) {
  const router = useRouter();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        height: 56,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-gray4)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 40,
      }}
    >
      {showBackButton && (
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginRight: 8,
            color: 'var(--color-text)',
          }}
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <span
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--color-text)',
        }}
      >
        {title}
      </span>
    </header>
  );
}
