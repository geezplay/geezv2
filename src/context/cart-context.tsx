"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { CartLine } from "@/lib/types";
import { useHydrated, useStorageRaw, writeStorage } from "@/lib/local-store";

const STORAGE_KEY = "geezplay.cart.v1";

function parseLines(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  has: (photoId: string) => boolean;
  add: (line: CartLine) => void;
  addMany: (lines: CartLine[]) => void;
  remove: (photoId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const raw = useStorageRaw(STORAGE_KEY);
  const ready = useHydrated();
  const lines = useMemo(() => parseLines(raw), [raw]);

  const persist = useCallback((next: CartLine[]) => {
    writeStorage(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (line: CartLine) => {
      if (lines.some((item) => item.photoId === line.photoId)) return;
      persist([...lines, line]);
    },
    [lines, persist],
  );

  const addMany = useCallback(
    (incoming: CartLine[]) => {
      const existing = new Set(lines.map((item) => item.photoId));
      const merged = [...lines];
      for (const line of incoming) {
        if (!existing.has(line.photoId)) {
          existing.add(line.photoId);
          merged.push(line);
        }
      }
      persist(merged);
    },
    [lines, persist],
  );

  const remove = useCallback(
    (photoId: string) => {
      persist(lines.filter((item) => item.photoId !== photoId));
    },
    [lines, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const has = useCallback(
    (photoId: string) => lines.some((item) => item.photoId === photoId),
    [lines],
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((total, line) => total + line.price, 0);
    return {
      lines,
      ready,
      count: lines.length,
      subtotal,
      has,
      add,
      addMany,
      remove,
      clear,
    };
  }, [lines, ready, has, add, addMany, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }
  return context;
}
