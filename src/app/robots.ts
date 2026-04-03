import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth/', '/my/'],
    },
    sitemap: 'https://bite-sized.xyz/sitemap.xml',
  };
}
