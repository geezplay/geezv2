import type {
  AdminUser,
  Catalog,
  Event,
  Order,
  OrderItem,
  Photo,
  RaceClass,
  Voucher,
} from "@prisma/client";

export function serializeEvent(
  event: Event,
  counts: { classCount: number; catalogCount: number; photoCount: number },
) {
  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    date: event.date.toISOString(),
    location: event.location,
    status: event.status,
    description: event.description,
    coverUrl: event.coverUrl ?? "",
    classCount: counts.classCount,
    catalogCount: counts.catalogCount,
    photoCount: counts.photoCount,
  };
}

export function serializeClass(raceClass: RaceClass, catalogCount: number) {
  return {
    id: raceClass.id,
    eventId: raceClass.eventId,
    name: raceClass.name,
    status: raceClass.status,
    order: raceClass.order,
    catalogCount,
  };
}

export function serializeCatalog(catalog: Catalog) {
  return {
    id: catalog.id,
    eventId: catalog.eventId,
    classId: catalog.classId,
    title: catalog.title,
    price: catalog.price,
    previewSheetId: catalog.previewSheetId,
    previewSheetUrl: catalog.previewSheetUrl ?? "",
    photoCount: catalog.photoCount,
    published: catalog.published,
    createdAt: catalog.createdAt.toISOString(),
  };
}

export function serializePhoto(photo: Photo) {
  return {
    id: photo.id,
    catalogId: photo.catalogId,
    eventId: photo.eventId,
    classId: photo.classId,
    previewSheetId: photo.previewSheetId,
    previewUrl: photo.previewUrl ?? "",
    sequence: photo.sequence,
    bibNumber: photo.bibNumber,
    startNumber: photo.startNumber,
    motorNumber: photo.motorNumber,
    ocrConfidence: photo.ocrConfidence,
    variant: photo.variant,
  };
}

export function serializeVoucher(voucher: Voucher) {
  return {
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    minTransaction: voucher.minTransaction,
    maxUsage: voucher.maxUsage,
    used: voucher.used,
    startDate: voucher.startDate.toISOString(),
    endDate: voucher.endDate.toISOString(),
    active: voucher.active,
  };
}

export function serializeOrderItem(item: OrderItem) {
  return {
    id: item.id,
    catalogId: item.catalogId,
    photoId: item.photoId,
    title: item.title,
    variant: item.variant,
    price: item.price,
    previewSheetId: item.previewSheetId,
  };
}

export function serializeOrder(order: Order & { items: OrderItem[] }) {
  return {
    id: order.id,
    email: order.buyerEmail,
    whatsapp: order.buyerWhatsapp,
    items: order.items.map(serializeOrderItem),
    voucherCode: order.voucherCode ?? undefined,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : undefined,
  };
}

export function serializeAdminUser(user: AdminUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : "-",
  };
}

export function serializeSettings(rows: Array<{ key: string; value: string }>) {
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const bool = (key: string, fallback: boolean) =>
    map[key] === undefined ? fallback : map[key] === "true";
  return {
    siteName: map.siteName ?? "GeezPlay",
    brandName: map.brandName ?? map.siteName ?? "GeezPlay",
    logoUrl: map.logoUrl ?? "",
    supportEmail: map.supportEmail ?? "",
    supportWhatsapp: map.supportWhatsapp ?? "",
    watermarkText: map.watermarkText ?? "GEEZPLAY",
    bankName: map.bankName ?? "",
    bankAccount: map.bankAccount ?? "",
    bankHolder: map.bankHolder ?? "",
    qrisEnabled: bool("qrisEnabled", true),
    bankTransferEnabled: bool("bankTransferEnabled", true),
    ewalletEnabled: bool("ewalletEnabled", true),
    downloadLinkTtlMinutes: Number(map.downloadLinkTtlMinutes ?? 15),
    maxUploadSizeMb: Number(map.maxUploadSizeMb ?? 25),
  };
}

export function serializePublicSettings(rows: Array<{ key: string; value: string }>) {
  const settings = serializeSettings(rows);
  return {
    siteName: settings.siteName,
    brandName: settings.brandName,
    logoUrl: settings.logoUrl,
    supportEmail: settings.supportEmail,
    supportWhatsapp: settings.supportWhatsapp,
    watermarkText: settings.watermarkText,
  };
}
