import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";
import type { Catalog, RaceEvent } from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${baseUrl}/events`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const [events, catalogs] = await Promise.all([
      apiFetch<RaceEvent[]>("/api/events"),
      apiFetch<Catalog[]>("/api/catalogs"),
    ]);

    const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(event.date),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const catalogRoutes: MetadataRoute.Sitemap = catalogs.map((catalog) => ({
      url: `${baseUrl}/catalog/${catalog.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...eventRoutes, ...catalogRoutes];
  } catch {
    return staticRoutes;
  }
}
