"use client";

import Link from "next/link";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { formatRupiah } from "@/lib/format";
import { PhotoThumb } from "@/components/ui/photo-thumb";
import { WatermarkOverlay } from "@/components/catalog/catalog-preview-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { IconCart, IconHeart, IconTrash } from "@/components/ui/icons";
import type { CartLine } from "@/lib/types";

export function WishlistView() {
  const wishlist = useWishlist();
  const cart = useCart();
  const { notify } = useToast();

  if (!wishlist.ready) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (wishlist.items.length === 0) {
    return (
      <EmptyState
        title="Belum ada foto favorit"
        description="Simpan foto yang menarik dengan menekan ikon hati, lalu beli nanti."
        icon={<IconHeart size={24} />}
        action={<ButtonLink href="/events">Jelajahi event</ButtonLink>}
      />
    );
  }

  const addToCart = (line: CartLine) => {
    if (cart.has(line.photoId)) {
      notify("Foto ini sudah ada di keranjang.", "info");
      return;
    }
    cart.add(line);
    notify("Foto ditambahkan ke keranjang.", "success");
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {wishlist.items.map((item) => {
        const line: CartLine = {
          photoId: item.photoId,
          catalogId: item.catalogId,
          eventId: item.eventId,
          classId: item.classId,
          title: item.title,
          variant: item.variant,
          price: item.price,
          previewSheetId: item.previewSheetId,
          previewUrl: item.previewUrl,
          bibNumber: item.bibNumber,
        };
        return (
          <li
            key={item.photoId}
            className="flex flex-col overflow-hidden rounded-xl border border-line bg-white"
          >
            <Link
              href={`/photos/${item.photoId}`}
              className="relative block aspect-[4/3]"
              aria-label={`Lihat foto nomor ${item.bibNumber}`}
            >
              <PhotoThumb
                previewUrl={item.previewUrl}
                seed={item.photoId}
                alt={`Preview foto nomor ${item.bibNumber}`}
                className="h-full w-full"
                label={`#${item.bibNumber}`}
              />
              <WatermarkOverlay dense />
            </Link>
            <div className="flex flex-1 flex-col p-3">
              <p className="truncate text-sm font-bold text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted">
                {item.eventName} · {item.className}
              </p>
              <p className="mt-1 text-sm font-bold text-primary-hover">
                {formatRupiah(item.price)}
              </p>
              <div className="mt-auto flex gap-2 pt-3">
                <Button size="sm" fullWidth onClick={() => addToCart(line)}>
                  <IconCart size={16} />
                  Keranjang
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    wishlist.remove(item.photoId);
                    notify("Foto dihapus dari favorit.", "info");
                  }}
                  aria-label={`Hapus foto nomor ${item.bibNumber} dari favorit`}
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
