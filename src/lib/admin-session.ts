"use client";

import { readStorage, writeStorage } from "@/lib/local-store";
import type { AdminSession } from "@/lib/types";

export const ADMIN_SESSION_KEY = "geezplay.admin-session.v1";

export function parseAdminSession(raw: string | null): AdminSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed && parsed.user && parsed.token) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function getAdminSession(): AdminSession | null {
  return parseAdminSession(readStorage(ADMIN_SESSION_KEY));
}

export function setAdminSession(session: AdminSession): void {
  writeStorage(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  writeStorage(ADMIN_SESSION_KEY, null);
}
