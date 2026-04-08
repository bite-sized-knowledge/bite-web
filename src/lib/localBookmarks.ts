import { Article } from '@/types/Article';
import * as articleApi from '@/lib/api/article';

const STORAGE_KEY = 'bite_local_bookmarks';

function read(): Record<string, Article> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function write(data: Record<string, Article>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isLocallyBookmarked(articleId: string): boolean {
  return articleId in read();
}

export function addLocalBookmark(article: Article) {
  const data = read();
  data[article.id] = { ...article, isArchived: true };
  write(data);
}

export function removeLocalBookmark(articleId: string) {
  const data = read();
  delete data[articleId];
  write(data);
}

export function getLocalBookmarkedArticles(): Article[] {
  return Object.values(read());
}

export function getLocalBookmarkIds(): string[] {
  return Object.keys(read());
}

export function clearLocalBookmarks() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Sync local bookmarks to the server after login/signup.
 * Fire-and-forget — failures are silently ignored.
 */
export function syncLocalBookmarksToServer() {
  const ids = getLocalBookmarkIds();
  if (ids.length === 0) return;
  Promise.allSettled(ids.map((id) => articleApi.addBookmark(id))).then(() => {
    clearLocalBookmarks();
  });
}
