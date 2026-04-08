import { Article } from '@/types/Article';
import * as articleApi from '@/lib/api/article';
import { createLocalStorage } from './storage';

const storage = createLocalStorage<Record<string, Article>>('bite_local_bookmarks', {});

// Module-level cache to avoid repeated JSON.parse on every CardFooter mount.
let cache: Record<string, Article> | null = null;

function read(): Record<string, Article> {
  if (cache) return cache;
  cache = storage.read();
  return cache;
}

function write(data: Record<string, Article>) {
  cache = data;
  storage.write(data);
}

function invalidate() {
  cache = null;
}

export function isLocallyBookmarked(articleId: string): boolean {
  return articleId in read();
}

export function addLocalBookmark(article: Article) {
  const data = { ...read() };
  data[article.id] = { ...article, isArchived: true };
  write(data);
}

export function removeLocalBookmark(articleId: string) {
  const data = { ...read() };
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
  storage.clear();
  invalidate();
}

/**
 * Sync local bookmarks to the server after login/signup.
 * Only clears bookmarks that were successfully synced.
 */
export function syncLocalBookmarksToServer() {
  const ids = getLocalBookmarkIds();
  if (ids.length === 0) return;
  Promise.allSettled(ids.map((id) => articleApi.addBookmark(id))).then(
    (results) => {
      const data = { ...read() };
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          delete data[ids[i]];
        }
      });
      if (Object.keys(data).length === 0) {
        clearLocalBookmarks();
      } else {
        write(data);
      }
    },
  );
}
