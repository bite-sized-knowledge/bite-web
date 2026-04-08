'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { Article } from '@/types/Article';
import { sendEvent, EVENT_TYPE, TARGET_TYPE } from '@/lib/api/event';
import { CardHeader } from '@/components/feed/CardHeader';
import { CardBody } from '@/components/feed/CardBody';
import { CardFooter } from '@/components/feed/CardFooter';

const DRAG_CLOSE_THRESHOLD = 80;

interface ArticlePreviewSheetProps {
  article: Article | null;
  query?: string;
  position?: number;
  source?: 'search' | 'bookmarks';
  onClose: () => void;
}

function SheetContent({
  article,
  query = '',
  position = 0,
  source = 'search',
  onClose,
}: {
  article: Article;
  query?: string;
  position?: number;
  source?: 'search' | 'bookmarks';
  onClose: () => void;
}) {
  const isSearch = source === 'search';
  const openedAtRef = useRef(Date.now());
  const articleOpenedRef = useRef(false);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // S_PREVIEW: fire on mount (search only)
  useEffect(() => {
    openedAtRef.current = Date.now();
    articleOpenedRef.current = false;
    if (isSearch) {
      sendEvent(TARGET_TYPE.ARTICLE, article.id, EVENT_TYPE.S_PREVIEW, {
        source: 'search',
        position,
        metadata: { query },
      });
    }
  }, [article.id, query, position, isSearch]);

  // S_PREVIEW_DISMISS: fire on unmount if article was NOT opened (search only)
  useEffect(() => {
    return () => {
      if (isSearch && !articleOpenedRef.current) {
        const duration = Date.now() - openedAtRef.current;
        sendEvent(
          TARGET_TYPE.ARTICLE,
          article.id,
          EVENT_TYPE.S_PREVIEW_DISMISS,
          {
            source: 'search',
            dwellTimeMs: duration,
            position,
            metadata: { query },
          },
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture click on CardBody area to fire S_CLICK (search only)
  const handleContentClick = () => {
    articleOpenedRef.current = true;
    if (isSearch) {
      sendEvent(TARGET_TYPE.ARTICLE, article.id, EVENT_TYPE.S_CLICK, {
        source: 'search',
        dwellTimeMs: Date.now() - openedAtRef.current,
        position,
        metadata: { query },
      });
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_THRESHOLD) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative w-full max-w-[640px] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[var(--color-card-bg)] shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 bg-[var(--color-card-bg)] rounded-t-2xl">
          <div className="h-1 w-10 rounded-full bg-[var(--color-gray3)]" />
        </div>

        {/* Card content — reuse feed card subcomponents */}
        <CardHeader blog={article.blog} />
        {/* onClickCapture fires S_CLICK before CardBody's openArticle */}
        <div onClickCapture={handleContentClick}>
          <CardBody article={article} />
        </div>
        <CardFooter article={article} />
      </motion.div>
    </div>
  );
}

export function ArticlePreviewSheet({
  article,
  query,
  position,
  source,
  onClose,
}: ArticlePreviewSheetProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {article && (
        <SheetContent
          key={article.id}
          article={article}
          query={query}
          position={position}
          source={source}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
