import { apiFetch, ApiError, buildQuery } from "@/lib/api";
import type { Catalog, CatalogPhoto, RaceClass, RaceEvent } from "@/lib/types";

export interface CatalogQuery {
  eventId?: string;
  classId?: string;
  query?: string;
}

export async function listCatalogs(filters: CatalogQuery = {}): Promise<Catalog[]> {
  return apiFetch<Catalog[]>(
    `/api/catalogs${buildQuery({
      eventId: filters.eventId,
      classId: filters.classId,
      query: filters.query,
    })}`,
  );
}

export async function getCatalog(id: string): Promise<Catalog | undefined> {
  try {
    return await apiFetch<Catalog>(`/api/catalogs/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function listCatalogPhotos(catalogId: string): Promise<CatalogPhoto[]> {
  return apiFetch<CatalogPhoto[]>(
    `/api/catalogs/${encodeURIComponent(catalogId)}/photos`,
  );
}

export interface PhotoContext {
  photo: CatalogPhoto;
  catalog: Catalog;
  event?: RaceEvent;
  raceClass?: RaceClass;
}

export async function getPhotoContext(
  photoId: string,
): Promise<PhotoContext | undefined> {
  try {
    return await apiFetch<PhotoContext>(`/api/photos/${encodeURIComponent(photoId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export interface SearchResult {
  catalog: Catalog;
  photos: CatalogPhoto[];
  event?: RaceEvent;
  raceClass?: RaceClass;
}

export async function searchPhotos(rawQuery: string): Promise<SearchResult[]> {
  const query = rawQuery.trim();
  if (!query) return [];
  return apiFetch<SearchResult[]>(`/api/search${buildQuery({ q: query })}`);
}
