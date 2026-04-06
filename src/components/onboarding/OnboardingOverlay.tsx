'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingSlide } from './OnboardingSlide';

const STORAGE_KEY = 'bite-onboarding-v1';

interface OnboardingState {
  completed: boolean;
  completedAt: number;
  version: 1;
}

/* ── Brand SVG illustrations ── */

function SwipeIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* Phone outline */}
      <rect x="30" y="10" width="60" height="100" rx="12" stroke="var(--color-main)" strokeWidth="3" fill="var(--color-gray4)" />
      <rect x="36" y="20" width="48" height="72" rx="4" fill="var(--color-bg)" />
      {/* Content lines */}
      <rect x="42" y="30" width="36" height="4" rx="2" fill="var(--color-main)" opacity="0.5" />
      <rect x="42" y="38" width="28" height="3" rx="1.5" fill="var(--color-gray3)" opacity="0.4" />
      <rect x="42" y="44" width="32" height="3" rx="1.5" fill="var(--color-gray3)" opacity="0.4" />
      {/* Arrow up */}
      <path d="M60 62 L54 68 M60 62 L66 68" stroke="var(--color-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Arrow down */}
      <path d="M60 78 L54 72 M60 78 L66 72" stroke="var(--color-main)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,0" dur="1.5s" repeatCount="indefinite" />
      </path>
      {/* Dot */}
      <circle cx="60" cy="100" r="3" fill="var(--color-gray3)" opacity="0.5" />
    </svg>
  );
}

function TabsIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* Tab bar background */}
      <rect x="15" y="35" width="90" height="50" rx="12" fill="var(--color-gray4)" />
      {/* Active tab (left) */}
      <rect x="22" y="42" width="38" height="36" rx="8" fill="var(--color-main)">
        <animate attributeName="x" values="22;60;22" dur="3s" repeatCount="indefinite" />
        <animate attributeName="width" values="38;38;38" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Tab text - 최신 */}
      <text x="41" y="64" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">
        최신
        <animate attributeName="fill" values="white;var(--color-gray3);white" dur="3s" repeatCount="indefinite" />
      </text>
      {/* Tab text - 추천 */}
      <text x="79" y="64" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-gray3)">
        추천
        <animate attributeName="fill" values="var(--color-gray3);white;var(--color-gray3)" dur="3s" repeatCount="indefinite" />
      </text>
    </svg>
  );
}

function BookmarkIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* Card background */}
      <rect x="20" y="20" width="80" height="80" rx="16" fill="var(--color-gray4)" />
      {/* Heart */}
      <path
        d="M42 55 C42 49, 50 45, 54 50 C58 45, 66 49, 66 55 C66 63, 54 70, 54 70 C54 70, 42 63, 42 55Z"
        fill="var(--color-main)"
        opacity="0.9"
      >
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite" />
        <animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.5s" additive="sum" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" />
      </path>
      {/* Bookmark */}
      <path
        d="M72 48 L72 72 L80 67 L88 72 L88 48 C88 46.5 86.5 45 85 45 L75 45 C73.5 45 72 46.5 72 48Z"
        fill="var(--color-main)"
        opacity="0.7"
      />
      {/* Share icon */}
      <circle cx="38" cy="85" r="8" fill="var(--color-main)" opacity="0.3" />
      <path d="M38 80 L38 88 M34 84 L38 80 L42 84" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      {/* Search circle */}
      <circle cx="52" cy="52" r="24" stroke="var(--color-main)" strokeWidth="4" fill="none">
        <animate attributeName="r" values="24;26;24" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Handle */}
      <line x1="70" y1="70" x2="90" y2="90" stroke="var(--color-main)" strokeWidth="4" strokeLinecap="round" />
      {/* Search lines inside */}
      <rect x="38" y="45" width="20" height="3" rx="1.5" fill="var(--color-main)" opacity="0.4">
        <animate attributeName="width" values="20;14;20" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="38" y="52" width="28" height="3" rx="1.5" fill="var(--color-main)" opacity="0.3">
        <animate attributeName="width" values="28;18;28" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="38" y="59" width="16" height="3" rx="1.5" fill="var(--color-main)" opacity="0.2" />
    </svg>
  );
}

interface SlideConfig {
  illustration: ReactNode;
  title: string;
  description: string;
}

const SLIDES: SlideConfig[] = [
  {
    illustration: <SwipeIllustration />,
    title: '스와이프로 아티클 탐색',
    description:
      '위아래로 스와이프해서 매일 엄선된\n기술 아티클을 확인하세요.\nPC에서는 방향키로도 탐색할 수 있어요.',
  },
  {
    illustration: <TabsIllustration />,
    title: '최신 & 추천 피드',
    description:
      '최신은 새로운 아티클 순,\n추천은 나의 관심사에 맞는 아티클을 보여줘요.',
  },
  {
    illustration: <BookmarkIllustration />,
    title: '좋아요, 공유, 저장',
    description:
      '마음에 드는 아티클에 좋아요를 누르고,\n공유하거나 쿠키에 저장해서\n나중에 다시 읽어보세요.',
  },
  {
    illustration: <SearchIllustration />,
    title: '원하는 기술, 바로 검색',
    description: '키워드로 기술 아티클을 검색할 수 있어요.',
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -60, opacity: 0 }),
};

function readOnboardingState(): OnboardingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as OnboardingState;
  } catch {
    return null;
  }
}

function writeOnboardingState() {
  if (typeof window === 'undefined') return;
  try {
    const state: OnboardingState = {
      completed: true,
      completedAt: Date.now(),
      version: 1,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function OnboardingOverlay() {
  const [shouldShow, setShouldShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (process.env.NODE_ENV === 'development') {
      setShouldShow(true);
    } else {
      const state = readOnboardingState();
      if (!state?.completed) {
        setShouldShow(true);
      }
    }
  }, []);

  const dismiss = () => {
    if (process.env.NODE_ENV !== 'development') {
      writeOnboardingState();
    }
    setShouldShow(false);
  };

  const goNext = () => {
    if (currentSlide === SLIDES.length - 1) {
      dismiss();
      return;
    }
    setDirection(1);
    setCurrentSlide((prev) => prev + 1);
  };

  const goPrev = () => {
    if (currentSlide === 0) return;
    setDirection(-1);
    setCurrentSlide((prev) => prev - 1);
  };

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const swipeThreshold = 40;
    const velocityThreshold = 300;

    if (
      info.offset.x < -swipeThreshold ||
      info.velocity.x < -velocityThreshold
    ) {
      goNext();
    } else if (
      info.offset.x > swipeThreshold ||
      info.velocity.x > velocityThreshold
    ) {
      goPrev();
    }
  };

  if (!mounted || !shouldShow) return null;

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={dismiss}
    >
      {/* Modal card */}
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 w-full max-w-[340px] overflow-hidden rounded-2xl bg-[var(--color-bg)] shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Skip button */}
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 text-sm text-[var(--color-gray3)] transition-colors hover:text-[var(--color-text)]"
        >
          건너뛰기
        </button>

        {/* Slide content */}
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <OnboardingSlide
              illustration={slide.illustration}
              title={slide.title}
              description={slide.description}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom area: dots + button */}
        <div className="flex flex-col items-center gap-4 px-6 pb-6">
          {/* Pagination dots */}
          <div className="flex gap-2">
            {SLIDES.map((_, index) => (
              <div
                key={index}
                className="h-2 rounded-full transition-all duration-200"
                style={{
                  width: index === currentSlide ? 20 : 8,
                  backgroundColor:
                    index === currentSlide
                      ? 'var(--color-main)'
                      : 'var(--color-gray4)',
                }}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-xl bg-[var(--color-main)] py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            {isLastSlide ? '시작하기' : '다음'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
