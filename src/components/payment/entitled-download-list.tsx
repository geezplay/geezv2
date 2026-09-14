"use client";

import { useState } from "react";
import type { OrderItem } from "@/lib/types";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/toast-context";
import { IconCheck, IconDownload, IconShield } from "@/components/ui/icons";
import { assetUrl, publicApiBaseUrl } from "@/lib/api";

export function EntitledDownloadList({
  items,
  orderId,
}: {
  items: OrderItem[];
  orderId?: string;
}) {
  const { notify } = useToast();
  const [downloaded, setDownloaded] = useState<string[]>([]);

  const handleDownload = (item: OrderItem) => {
    // Determine orderId from prop or path
    const resolvedOrderId =
      orderId ||
      (typeof window !== "undefined"
        ? window.location.pathname.split("/").filter(Boolean).pop()
        : "");

    if (!resolvedOrderId) {
      notify("ID pesanan tidak ditemukan.", "error");
      return;
    }

    const downloadUrl = `${publicApiBaseUrl()}/api/orders/${encodeURIComponent(
      resolvedOrderId,
    )}/download/${encodeURIComponent(item.photoId)}`;

    // Create a temporary hidden anchor to trigger download from backend
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `GeezPlay-${resolvedOrderId}-${item.photoId}.jpg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setDownloaded((current) =>
      current.includes(item.id) ? current : [...current, item.id],
    );
    notify("Mengunduh berkas foto original…", "success");
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((item) => {
          const isDownloaded = downloaded.includes(item.id);
          const previewSrc = item.previewUrl ? assetUrl(item.previewUrl) : null;

          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 shadow-xs"
            >
              <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewSrc}
                    alt={`Foto ${item.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PhotoPlaceholder
                    seed={item.photoId}
                    alt={`Foto ${item.title}`}
                    className="h-full w-full"
                  />
                )}
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
        <IconShield size={16} className="mt-0.5 shrink-0 text-primary" />
        <span>
          Unduhan resmi GeezPlay: Foto beresolusi penuh tanpa watermark. Tautan ini diverifikasi
          langsung oleh status pembayaran pesanan kamu.
        </span>
      </p>
    </div>
  );
}
