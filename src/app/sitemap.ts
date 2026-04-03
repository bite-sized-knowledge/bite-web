import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://bite-sized.xyz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://bite-sized.xyz/feed',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: 'https://bite-sized.xyz/auth/login',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Fetch blog list for dynamic entries
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/blogs`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      const blogs = data?.result ?? [];
      const blogPages: MetadataRoute.Sitemap = blogs.map(
        (blog: { id: string }) => ({
          url: `https://bite-sized.xyz/blog/${blog.id}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        }),
      );
      return [...staticPages, ...blogPages];
    }
  } catch {
    // fallback to static pages only
  }

  return staticPages;
}
