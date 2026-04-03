'use client';

import React from 'react';
import { Article } from '@/types/Article';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';

interface FeedCardProps {
  article: Article;
}

export const FeedCard: React.FC<FeedCardProps> = ({ article }) => {
  return (
    <div className="min-w-[320px] w-full overflow-hidden rounded-2xl bg-[var(--color-card-bg)] shadow-md">
      <CardHeader blog={article.blog} />
      <CardBody article={article} />
      <CardFooter article={article} />
    </div>
  );
};
