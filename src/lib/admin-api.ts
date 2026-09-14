"use client";

import { apiFetch, ApiError } from "@/lib/api";
import { clearAdminSession, getAdminSession } from "@/lib/admin-session";

interface AdminFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function adminFetch<T>(
  path: string,
  options: AdminFetchOptions = {},
): Promise<T> {
  const token = getAdminSession()?.token;
  try {
    return await apiFetch<T>(path, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAdminSession();
    }
    throw error;
  }
}
