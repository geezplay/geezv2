"use client";

import { useEffect, useState } from "react";
import { IconClose } from "@/components/ui/icons";

export function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const clamp = (value: number) => Math.min(5, Math.max(1, value));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[60] flex flex-col bg-black/92 p-3 sm:p-4"
    >
      <div className="flex items-center justify-between gap-3 pb-3">
        <p className="min-w-0 truncate text-xs text-white/80 sm:text-sm">{alt}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScale((value) => clamp(value - 0.5))}
            aria-label="Perkecil"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-lg font-bold text-white hover:bg-white/10"
          >
            −
          </button>
          <span className="w-12 text-center text-xs font-semibold text-white/80">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((value) => clamp(value + 0.5))}
            aria-label="Perbesar"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-lg font-bold text-white hover:bg-white/10"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10"
          >
            <IconClose size={18} />
          </button>
        </div>
      </div>
      <div
        className="flex flex-1 items-center justify-center overflow-auto"
        onClick={onClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          onClick={(event) => event.stopPropagation()}
          style={{ transform: `scale(${scale})` }}
          className="max-h-full max-w-full object-contain transition-transform duration-150"
        />
      </div>
      <p className="pt-2 text-center text-[11px] text-white/50">
        Preview resolusi rendah ber-watermark · original hanya setelah pembayaran
      </p>
    </div>
  );
}
