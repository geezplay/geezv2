import Link from "next/link";
import type { Catalog, RaceClass, RaceEvent } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { CatalogPreviewSheet } from "@/components/catalog/catalog-preview-sheet";
import { Badge } from "@/components/ui/badge";

interface CatalogCardProps {
  catalog: Catalog;
  event?: RaceEvent;
  raceClass?: RaceClass;
}

export function CatalogCard({ catalog, event, raceClass }: CatalogCardProps) {
  const alt = `Preview gabungan katalog ${catalog.title}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white">
      <Link
        href={`/catalog/${catalog.id}`}
        className="block p-2"
        aria-label={`Buka katalog ${catalog.title}`}
      >
        <CatalogPreviewSheet
          previewSheetId={catalog.previewSheetId}
          previewSheetUrl={catalog.previewSheetUrl}
          photoCount={catalog.photoCount}
          alt={alt}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
          denseWatermark
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-4 pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="info">{catalog.photoCount} foto</Badge>
          {raceClass ? <Badge tone="neutral">{raceClass.name}</Badge> : null}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-ink">
          <Link href={`/catalog/${catalog.id}`} className="hover:text-primary-hover">
            {catalog.title}
          </Link>
        </h3>
        {event ? <p className="text-xs text-muted">{event.name}</p> : null}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-primary-hover">
            {formatRupiah(catalog.price)}
          </span>
          <span className="text-xs text-muted">per foto</span>
        </div>
      </div>
    </article>
  );
}
