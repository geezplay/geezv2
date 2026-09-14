"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  listAdminClasses,
  listAdminEvents,
  listClassPhotos,
  type ClassPhotoItem,
} from "@/services/admin-service";
import type { CatalogPhoto, RaceClass, RaceEvent } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { AdminPageHeader, SectionCard } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/feedback";
import { PhotoThumb } from "@/components/ui/photo-thumb";
import { WatermarkOverlay } from "@/components/catalog/catalog-preview-sheet";
import { Lightbox } from "@/components/ui/lightbox";
import { assetUrl } from "@/lib/api";
import { IconArrowLeft, IconImage } from "@/components/ui/icons";

export default function AdminClassPhotosPage() {
  const params = useParams<{ eventId: string; classId: string }>();
  const { eventId, classId } = params;

  const [event, setEvent] = useState<RaceEvent | null>(null);
  const [raceClass, setRaceClass] = useState<RaceClass | null>(null);
  const [items, setItems] = useState<ClassPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      listAdminEvents(),
      listAdminClasses(),
      listClassPhotos(classId),
    ])
      .then(([events, classes, photos]) => {
        if (!active) return;
        setEvent(events.find((item) => item.id === eventId) ?? null);
        setRaceClass(classes.find((item) => item.id === classId) ?? null);
        setItems(photos);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Gagal memuat foto.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId, classId]);

  const groups = useMemo(() => {
    const map = new Map<string, { catalog: ClassPhotoItem["catalog"]; photos: CatalogPhoto[] }>();
    for (const item of items) {
      const group = map.get(item.catalog.id) ?? { catalog: item.catalog, photos: [] };
      group.photos.push(item.photo);
      map.set(item.catalog.id, group);
    }
    return [...map.values()];
  }, [items]);

  return (
    <div>
      <Link
        href={`/admin/catalogs/${eventId}`}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary-hover"
      >
        <IconArrowLeft size={16} />
        {event?.name ?? "Kelas"}
      </Link>
      <AdminPageHeader
        title={raceClass?.name ?? "Foto Kelas"}
        description={
          event
            ? `${event.name} · ${items.length} foto terupload`
            : `${items.length} foto terupload`
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm font-medium text-danger">{error}</p>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          Belum ada foto diupload untuk kelas ini.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <SectionCard
              key={group.catalog.id}
              title={group.catalog.title}
              description={`${group.photos.length} foto · ${formatRupiah(group.catalog.price)} per foto`}
              action={
                group.catalog.published ? (
                  <Badge tone="primary">Publish</Badge>
                ) : (
                  <Badge tone="neutral">Draft</Badge>
                )
              }
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {group.photos.map((photo) => (
                  <li key={photo.id}>
                    <div className="overflow-hidden rounded-lg border border-line">
                      <button
                        type="button"
                        onClick={() => {
                          const src = assetUrl(photo.previewUrl);
                          if (src) {
                            setZoom({
                              src,
                              alt: `Preview foto nomor ${photo.bibNumber}`,
                            });
                          }
                        }}
                        className="block w-full cursor-zoom-in"
                        aria-label={`Perbesar foto nomor ${photo.bibNumber}`}
                      >
                        <div className="relative aspect-square">
                          <PhotoThumb
                            previewUrl={photo.previewUrl}
                            seed={photo.id}
                            alt={`Preview foto nomor ${photo.bibNumber}`}
                            className="h-full w-full"
                          />
                          <WatermarkOverlay dense />
                        </div>
                      </button>
                      <div className="space-y-0.5 p-2">
                        <p className="text-[11px] text-muted">
                          Bib {photo.bibNumber} · Start {photo.startNumber}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          Motor {photo.motorNumber} · {photo.variant}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
          <p className="flex items-center gap-2 text-xs text-muted">
            <IconImage size={14} />
            Menampilkan {items.length} foto dari {groups.length} katalog. Preview memakai
            watermark; file original disimpan privat.
          </p>
        </div>
      )}

      {zoom ? (
        <Lightbox src={zoom.src} alt={zoom.alt} onClose={() => setZoom(null)} />
      ) : null}
    </div>
  );
}
