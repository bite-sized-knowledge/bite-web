'use client';

import React from 'react';
import { Article } from '@/types/Article';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { NotInterestedMenu } from './NotInterestedMenu';

interface FeedCardProps {
  article: Article;
  onUninterest: (articleId: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ article, onUninterest }) => {
  return (
    <div className="min-w-[320px] w-full overflow-hidden rounded-2xl bg-[var(--color-card-bg)] shadow-md">
      <CardHeader
        blog={article.blog}
        trailing={
          <NotInterestedMenu
            articleId={article.id}
            onUninterest={onUninterest}
          />
        }
      />
      <CardBody article={article} />
      <CardFooter article={article} />
    </div>
  );
};
