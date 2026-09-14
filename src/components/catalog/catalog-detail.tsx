"use client";

import { useMemo, useState } from "react";
import type { Catalog, CatalogPhoto, RaceClass, RaceEvent } from "@/lib/types";
import { classNames, formatRupiah } from "@/lib/format";
import { toCartLine, toWishlistItem } from "@/lib/builders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/context/toast-context";
import { IconCart, IconCheck, IconHeart } from "@/components/ui/icons";

interface CatalogDetailProps {
  catalog: Catalog;
  photos: CatalogPhoto[];
  event?: RaceEvent;
  raceClass?: RaceClass;
}

export function CatalogDetail({ catalog, photos, event, raceClass }: CatalogDetailProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const { addMany } = useCart();
  const wishlist = useWishlist();
  const { notify } = useToast();

  const selectedPhotos = useMemo(
    () => photos.filter((photo) => selected.includes(photo.id)),
    [photos, selected],
  );
  const total = selectedPhotos.length * catalog.price;

  const toggleSelect = (photoId: string) => {
    setSelected((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId],
    );
  };

  const allSelected = selected.length === photos.length && photos.length > 0;

  const handleAddToCart = () => {
    if (selectedPhotos.length === 0) return;
    addMany(selectedPhotos.map((photo) => toCartLine(catalog, photo)));
    notify(`${selectedPhotos.length} foto ditambahkan ke keranjang.`, "success");
    setSelected([]);
  };

  const handleWishlist = (photo: CatalogPhoto) => {
    const isSaved = wishlist.has(photo.id);
    wishlist.toggle(
      toWishlistItem(catalog, photo, {
        eventName: event?.name ?? "-",
        className: raceClass?.name ?? "-",
      }),
    );
    notify(
      isSaved ? "Foto dihapus dari favorit." : "Foto disimpan ke favorit.",
      isSaved ? "info" : "success",
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSelected(allSelected ? [] : photos.map((photo) => photo.id))
            }
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-primary hover:text-primary-hover"
          >
            {allSelected ? "Kosongkan pilihan" : "Pilih semua"}
          </button>
          <span className="text-sm text-muted" aria-live="polite">
            {selected.length} dari {photos.length} foto dipilih
          </span>
        </div>
        {selected.length > 0 ? (
          <span className="text-sm font-bold text-primary-hover">
            Subtotal {formatRupiah(total)}
          </span>
        ) : null}
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {photos.map((photo) => {
          const isSelected = selected.includes(photo.id);
          const isSaved = wishlist.ready && wishlist.has(photo.id);
          return (
            <li key={photo.id}>
              <div
                className={classNames(
                  "relative flex items-center gap-3 rounded-lg border-2 bg-white p-3 pr-11",
                  isSelected ? "border-primary bg-primary-soft" : "border-line",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSelect(photo.id)}
                  aria-pressed={isSelected}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-label={`${isSelected ? "Batalkan pilihan" : "Pilih"} foto nomor ${photo.sequence}`}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2",
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-line text-transparent",
                    )}
                  >
                    <IconCheck size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-black leading-tight text-ink">
                      {photo.sequence}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWishlist(photo)}
                  aria-pressed={isSaved}
                  aria-label={isSaved ? "Hapus dari favorit" : "Simpan ke favorit"}
                  className={classNames(
                    "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border",
                    isSaved ? "border-danger/40 text-danger" : "border-line text-muted",
                  )}
                >
                  <IconHeart size={16} filled={isSaved} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-semibold text-ink">
              {selected.length > 0
                ? `${selected.length} foto dipilih`
                : "Pilih nomor foto yang ingin dibeli"}
            </p>
            <p className="text-muted">
              {selected.length > 0
                ? `Total ${formatRupiah(total)}`
                : `Harga ${formatRupiah(catalog.price)} per foto`}
            </p>
          </div>
          <Button onClick={handleAddToCart} disabled={selected.length === 0}>
            <IconCart size={18} />
            Tambah ke keranjang
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted">
        <Badge tone="info">Tanpa preview</Badge>{" "}
        Pilihan hanya menampilkan nomor bib. Foto asli dan preview hanya bisa dilihat
        setelah pembayaran terverifikasi.
      </p>
    </div>
  );
}
