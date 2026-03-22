"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  readonly id: string;
  readonly type: ToastType;
  readonly message: string;
  readonly createdAt: number;
}

interface ToastOptions {
  readonly type?: ToastType;
  readonly duration?: number;
}

const DEFAULT_DURATION = 5000;

export function useToast() {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Cleanup all pending timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const { type = "info", duration = DEFAULT_DURATION } = options;
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const newToast: Toast = {
        id,
        type,
        message,
        createdAt: Date.now(),
      };

      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);

      return id;
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      addToast(message, { type: "success", duration }),
    [addToast],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addToast(message, { type: "error", duration }),
    [addToast],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      addToast(message, { type: "info", duration }),
    [addToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addToast(message, { type: "warning", duration }),
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  } as const;
}
