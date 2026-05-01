import type { Metadata } from 'next';

interface BlogMetaResponse {
  result?: {
    title?: string;
    url?: string;
    favicon?: string;
  };
}

const API_BASE = 'https://api.bite-sized.xyz';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ blogId: string }>;
}): Promise<Metadata> {
  const { blogId } = await params;
  let title = '블로그';
  let description = 'BITE에서 큐레이션한 기술 블로그의 글들을 확인해보세요.';
  try {
    const res = await fetch(`${API_BASE}/v1/blogs/${blogId}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as BlogMetaResponse;
      if (data.result?.title) {
        title = data.result.title;
        description = `${data.result.title}에서 발행된 기술 글 모음. BITE에서 큐레이션합니다.`;
      }
    }
  } catch {
    // fall through with defaults
  }
  const canonical = `https://bite-sized.xyz/blog/${blogId}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | BITE`,
      description,
      url: canonical,
    },
  };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
