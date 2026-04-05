'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastItem {
  id: number;
  message: string;
}

interface ToastContextValue {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const show = useCallback((message: string) => {
    const id = nextIdRef.current++;
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  // Auto-dismiss oldest toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tabbar-height,0px)+16px)] z-[100] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto max-w-sm rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur"
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider>');
  }
  return ctx;
}
