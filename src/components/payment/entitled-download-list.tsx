"use client";

import { useState } from "react";
import type { OrderItem } from "@/lib/types";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { IconCheck, IconDownload, IconShield } from "@/components/ui/icons";

function buildOriginalSvg(item: OrderItem): string {
  const escaped = item.title.replace(/[<>&]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <text x="60" y="700" fill="#ffffff" font-family="sans-serif" font-size="42" font-weight="700">GEEZPLAY ORIGINAL</text>
  <text x="60" y="750" fill="#d1fae5" font-family="sans-serif" font-size="26">${escaped}</text>
</svg>`;
}

export function EntitledDownloadList({ items }: { items: OrderItem[] }) {
  const { notify } = useToast();
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const handleDownload = (item: OrderItem) => {
    const blob = new Blob([buildOriginalSvg(item)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${item.photoId}-original.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setDownloaded((current) =>
      current.includes(item.id) ? current : [...current, item.id],
    );
    notify("Tautan unduhan aman dibuat. Berlaku 15 menit.", "success");
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((item) => {
          const isDownloaded = downloaded.includes(item.id);
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
            >
              <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                <PhotoPlaceholder
                  seed={item.photoId}
                  alt={`Foto ${item.title}`}
                  className="h-full w-full"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{item.title}</p>
                <p className="text-xs text-muted">{item.variant}</p>
                {isDownloaded ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary-hover">
                    <IconCheck size={14} />
                    Sudah diunduh
                  </p>
                ) : null}
              </div>
              <Button
                size="sm"
                variant={isDownloaded ? "secondary" : "primary"}
                onClick={() => handleDownload(item)}
                aria-label={`Unduh foto ${item.title} resolusi penuh`}
              >
                <IconDownload size={16} />
                <span className="hidden sm:inline">Unduh</span>
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="flex items-start gap-2 rounded-lg border border-line bg-surface p-3 text-xs text-muted">
        <IconShield size={16} />
        Demo frontend: tombol unduh menghasilkan berkas contoh. Di produksi, tombol ini
        meminta signed URL ke backend yang memverifikasi order, status Paid, dan
        entitlement sebelum mengirim foto original.
      </p>
    </div>
  );
}
