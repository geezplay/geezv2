import { apiFetch, ApiError } from "@/lib/api";
import type { RaceClass, RaceEvent } from "@/lib/types";

export async function listEvents(): Promise<RaceEvent[]> {
  return apiFetch<RaceEvent[]>("/api/events");
}

export async function listReadyEvents(): Promise<RaceEvent[]> {
  return apiFetch<RaceEvent[]>("/api/events?status=ready");
}

export async function getEvent(idOrSlug: string): Promise<RaceEvent | undefined> {
  try {
    return await apiFetch<RaceEvent>(`/api/events/${encodeURIComponent(idOrSlug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function listClasses(eventId: string): Promise<RaceClass[]> {
  return apiFetch<RaceClass[]>(`/api/events/${encodeURIComponent(eventId)}/classes`);
}

export async function getClassById(classId: string): Promise<RaceClass | undefined> {
  try {
    return await apiFetch<RaceClass>(`/api/classes/${encodeURIComponent(classId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}
