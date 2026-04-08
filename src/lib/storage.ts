/**
 * SSR-safe typed localStorage wrapper with JSON serialization.
 * Centralizes the typeof-window guard + try/catch boilerplate.
 */
export function createLocalStorage<T>(key: string, fallback: T) {
  return {
    read(): T {
      if (typeof window === 'undefined') return fallback;
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    write(value: T) {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch { /* ignore quota errors */ }
    },
    clear() {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    },
  };
}
