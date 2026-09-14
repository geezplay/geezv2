"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { WishlistItem } from "@/lib/types";
import { useHydrated, useStorageRaw, writeStorage } from "@/lib/local-store";

const STORAGE_KEY = "geezplay.wishlist.v2";

function parseItems(raw: string | null): WishlistItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface WishlistContextValue {
  items: WishlistItem[];
  ready: boolean;
  count: number;
  has: (photoId: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (photoId: string) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const raw = useStorageRaw(STORAGE_KEY);
  const ready = useHydrated();
  const items = useMemo(() => parseItems(raw), [raw]);

  const persist = useCallback((next: WishlistItem[]) => {
    writeStorage(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (item: WishlistItem) => {
      const exists = items.some((entry) => entry.photoId === item.photoId);
      persist(
        exists
          ? items.filter((entry) => entry.photoId !== item.photoId)
          : [...items, item],
      );
    },
    [items, persist],
  );

  const remove = useCallback(
    (photoId: string) => {
      persist(items.filter((entry) => entry.photoId !== photoId));
    },
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const has = useCallback(
    (photoId: string) => items.some((entry) => entry.photoId === photoId),
    [items],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ items, ready, count: items.length, has, toggle, remove, clear }),
    [items, ready, has, toggle, remove, clear],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist harus digunakan di dalam WishlistProvider");
  }
  return context;
}
