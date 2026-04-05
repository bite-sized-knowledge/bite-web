'use client';

import Lottie from 'lottie-react';
import animationData from '@/assets/lottie/search.json';

export function SearchLoadingLottie() {
  return (
    <div className="h-32 w-32">
      <Lottie animationData={animationData} loop autoplay />
    </div>
  );
}
