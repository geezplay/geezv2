"use client";

import Link from "next/link";
import { useState } from "react";
import type { Catalog, CatalogPhoto, RaceClass, RaceEvent } from "@/lib/types";
import { classNames, formatRupiah } from "@/lib/format";
import { assetUrl } from "@/lib/api";
import { toCartLine, toWishlistItem } from "@/lib/builders";
import { PhotoThumb } from "@/components/ui/photo-thumb";
import { Lightbox } from "@/components/ui/lightbox";
import { WatermarkOverlay } from "@/components/catalog/catalog-preview-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/context/toast-context";
import { IconCart, IconHeart, IconLock, IconSearch } from "@/components/ui/icons";

interface PhotoDetailProps {
  photo: CatalogPhoto;
  catalog: Catalog;
  event?: RaceEvent;
  raceClass?: RaceClass;
  siblings: CatalogPhoto[];
}

export function PhotoDetail({
  photo,
  catalog,
  event,
  raceClass,
  siblings,
}: PhotoDetailProps) {
  const cart = useCart();
  const wishlist = useWishlist();
  const { notify } = useToast();
  const [zoomOpen, setZoomOpen] = useState(false);
  const previewSrc = assetUrl(photo.previewUrl);

  const inCart = cart.ready && cart.has(photo.id);
  const saved = wishlist.ready && wishlist.has(photo.id);

  const addToCart = () => {
    if (inCart) {
      notify("Foto ini sudah ada di keranjang.", "info");
      return;
    }
    cart.add(toCartLine(catalog, photo));
    notify("Foto ditambahkan ke keranjang.", "success");
  };

  const toggleWishlist = () => {
    wishlist.toggle(
      toWishlistItem(catalog, photo, {
        eventName: event?.name ?? "-",
        className: raceClass?.name ?? "-",
      }),
    );
    notify(saved ? "Foto dihapus dari favorit." : "Foto disimpan ke favorit.", saved ? "info" : "success");
  };

  const meta = [
    { label: "Nomor Bib", value: photo.bibNumber },
    { label: "Nomor Start", value: photo.startNumber },
    { label: "Nomor Motor", value: photo.motorNumber },
    { label: "Variasi", value: photo.variant },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div>
        <div className="relative overflow-hidden rounded-xl border border-line bg-slate-900">
          <button
            type="button"
            onClick={() => {
              if (previewSrc) setZoomOpen(true);
            }}
            disabled={!previewSrc}
            className="block w-full cursor-zoom-in disabled:cursor-default"
            aria-label="Perbesar preview foto"
          >
            <div className="aspect-[4/3]">
              <PhotoThumb
                previewUrl={photo.previewUrl}
                seed={photo.id}
                alt={`Preview foto nomor ${photo.bibNumber} dari katalog ${catalog.title}`}
                className="h-full w-full"
              />
            </div>
          </button>
          <WatermarkOverlay />
          <span className="absolute left-3 top-3">
            <Badge tone="neutral">Preview ber-watermark</Badge>
          </span>
          {previewSrc ? (
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
              <IconSearch size={12} />
              Klik untuk perbesar
            </span>
          ) : null}
        </div>

        {zoomOpen && previewSrc ? (
          <Lightbox
            src={previewSrc}
            alt={`Preview foto nomor ${photo.bibNumber}`}
            onClose={() => setZoomOpen(false)}
          />
        ) : null}

        <div className="mt-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <IconLock size={16} />
            Foto resolusi penuh terkunci
          </p>
          <p className="mt-1">
            Original hanya tersedia untuk foto yang sudah dibeli dan dibayar. Halaman
            unduhan aktif otomatis setelah pembayaran terverifikasi.
          </p>
        </div>

        {siblings.length > 1 ? (
          <section className="mt-6" aria-labelledby="foto-lainnya">
            <h2 id="foto-lainnya" className="mb-3 text-sm font-bold text-ink">
              Foto lain di katalog ini ({siblings.length})
            </h2>
            <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {siblings.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/photos/${item.id}`}
                    aria-current={item.id === photo.id ? "page" : undefined}
                    className={classNames(
                      "block overflow-hidden rounded-lg border-2",
                      item.id === photo.id ? "border-primary" : "border-line",
                    )}
                  >
                    <PhotoThumb
                      previewUrl={item.previewUrl}
                      seed={item.id}
                      alt={`Foto nomor ${item.bibNumber}`}
                      className="aspect-square h-full w-full"
                      label={`#${item.bibNumber}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm text-primary-hover">
            <Link href={`/catalog/${catalog.id}`} className="font-semibold hover:underline">
              {catalog.title}
            </Link>
          </p>
          <h1 className="mt-1 text-xl font-bold text-ink sm:text-2xl">
            Foto #{photo.bibNumber}
          </h1>
          {event ? (
            <p className="mt-1 text-sm text-muted">
              {event.name}
              {raceClass ? ` · ${raceClass.name}` : ""}
            </p>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-3">
          {meta.map((item) => (
            <div key={item.label} className="rounded-lg border border-line bg-white p-3">
              <dt className="text-xs text-muted">{item.label}</dt>
              <dd className="text-sm font-bold text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-xs text-muted">
          Akurasi OCR nomor: {Math.round(photo.ocrConfidence * 100)}%. Nomor dapat
          dikoreksi oleh admin bila hasil kurang yakin.
        </p>

        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-sm text-muted">Harga foto</p>
          <p className="text-2xl font-bold text-primary-hover">
            {formatRupiah(catalog.price)}
          </p>
          <div className="mt-4 space-y-2">
            <Button fullWidth onClick={addToCart} disabled={inCart}>
              <IconCart size={18} />
              {inCart ? "Sudah di keranjang" : "Tambah ke keranjang"}
            </Button>
            <Button variant="secondary" fullWidth onClick={toggleWishlist}>
              <IconHeart size={18} filled={saved} />
              {saved ? "Hapus dari favorit" : "Simpan ke favorit"}
            </Button>
            <ButtonLinkToCatalog catalogId={catalog.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonLinkToCatalog({ catalogId }: { catalogId: string }) {
  return (
    <Link
      href={`/catalog/${catalogId}`}
      className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-primary bg-transparent text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
    >
      Lihat semua foto di katalog
    </Link>
  );
}
