"use client";

import { useState } from "react";
import { assetUrl } from "@/lib/api";
import { classNames } from "@/lib/format";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Lightbox } from "@/components/ui/lightbox";
import { IconSearch } from "@/components/ui/icons";

export function WatermarkOverlay({ dense = false }: { dense?: boolean }) {
  const text = "GEEZPLAY \u2022 PREVIEW \u2022 GEEZPLAY \u2022 PREVIEW";
  return (
    <div
      aria-hidden="true"
      className={classNames(
        "pointer-events-none absolute inset-0 flex flex-col justify-center overflow-hidden opacity-[0.16]",
        dense ? "gap-3" : "gap-6",
      )}
    >
      {[0, 1, 2].map((row) => (
        <span
          key={row}
          className={classNames(
            "whitespace-nowrap font-black uppercase tracking-[0.3em] text-white",
            dense ? "text-[8px]" : "text-xs",
          )}
          style={{
            transform:
              "translateX(" + (row % 2 === 0 ? "-6%" : "-14%") + ") rotate(-12deg)",
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}

interface CatalogPreviewSheetProps {
  previewSheetId: string;
  previewSheetUrl?: string;
  photoCount: number;
  alt: string;
  className?: string;
  denseWatermark?: boolean;
  zoomable?: boolean;
}

export function CatalogPreviewSheet({
  previewSheetId,
  previewSheetUrl,
  photoCount,
  alt,
  className,
  denseWatermark,
  zoomable,
}: CatalogPreviewSheetProps) {
  const sheetUrl = assetUrl(previewSheetUrl);
  const [open, setOpen] = useState(false);

  if (sheetUrl) {
    const label = alt + " (" + photoCount + " foto dalam 1 preview gabungan)";
    const image = (
      <div
        role="img"
        aria-label={label}
        className={classNames(
          "relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-900 bg-contain bg-center bg-no-repeat",
          className,
        )}
        style={{ backgroundImage: "url(" + encodeURI(sheetUrl) + ")" }}
      >
        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
          {photoCount} foto
        </span>
        {zoomable ? (
          <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
            <IconSearch size={12} />
            Perbesar
          </span>
        ) : null}
      </div>
    );

    if (!zoomable) return image;

    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-zoom-in"
          aria-label="Perbesar preview katalog"
        >
          {image}
        </button>
        {open ? (
          <Lightbox src={sheetUrl} alt={alt} onClose={() => setOpen(false)} />
        ) : null}
      </>
    );
  }

  const tiles = Math.max(1, Math.min(photoCount, 10));
  const columns = tiles >= 5 ? 5 : tiles >= 3 ? 3 : 2;

  return (
    <div
      role="img"
      aria-label={alt + " (" + photoCount + " foto dalam 1 preview gabungan)"}
      className={classNames(
        "relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-900",
        className,
      )}
    >
      <div
        className="grid h-full w-full gap-px"
        style={{ gridTemplateColumns: "repeat(" + columns + ", minmax(0, 1fr))" }}
      >
        {Array.from({ length: tiles }).map((_, index) => (
          <PhotoPlaceholder
            key={index}
            seed={previewSheetId + "-tile-" + index}
            alt=""
            className="h-full w-full"
          />
        ))}
      </div>
      <WatermarkOverlay dense={denseWatermark} />
      <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
        {photoCount} foto
      </span>
    </div>
  );
}
