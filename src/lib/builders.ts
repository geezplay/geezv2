import type { CartLine, Catalog, CatalogPhoto, WishlistItem } from "@/lib/types";

export function toCartLine(catalog: Catalog, photo: CatalogPhoto): CartLine {
  return {
    photoId: photo.id,
    catalogId: catalog.id,
    eventId: photo.eventId,
    classId: photo.classId,
    title: catalog.title,
    variant: photo.variant,
    price: catalog.price,
    previewSheetId: photo.previewSheetId,
    previewUrl: photo.previewUrl,
    bibNumber: photo.bibNumber,
  };
}

export function toWishlistItem(
  catalog: Catalog,
  photo: CatalogPhoto,
  context: { eventName: string; className: string },
): WishlistItem {
  return {
    ...toCartLine(catalog, photo),
    eventName: context.eventName,
    className: context.className,
  };
}
