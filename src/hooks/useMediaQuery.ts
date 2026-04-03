'use client';

import { useState, useEffect } from 'react';

interface MediaQueryResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useMediaQuery(): MediaQueryResult {
  const [result, setResult] = useState<MediaQueryResult>({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setResult({
        isMobile: width < 768,
        isTablet: width >= 768 && width <= 1024,
        isDesktop: width > 1024,
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return result;
}
