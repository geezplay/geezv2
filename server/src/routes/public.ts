import { Router } from "express";
import { z } from "zod";
import type { Catalog, Photo, Setting } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError, asyncHandler } from "../lib/http";
import {
  serializeCatalog,
  serializeClass,
  serializeEvent,
  serializeOrder,
  serializePhoto,
  serializePublicSettings,
  serializeVoucher,
} from "../lib/serialize";

export const publicRouter = Router();

async function eventCounts(eventId: string) {
  const [classCount, catalogCount, photoCount] = await Promise.all([
    prisma.raceClass.count({ where: { eventId } }),
    prisma.catalog.count({ where: { eventId, published: true } }),
    prisma.photo.count({ where: { eventId, published: true } }),
  ]);
  return { classCount, catalogCount, photoCount };
}

async function classCatalogCount(classId: string) {
  return prisma.catalog.count({ where: { classId, published: true } });
}

publicRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    let database = "down";
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }
    res.status(database === "up" ? 200 : 503).json({
      status: database === "up" ? "ok" : "degraded",
      service: "geezplay-api",
      database,
    });
  }),
);

publicRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany();
    res.json(serializePublicSettings(rows));
  }),
);

publicRouter.get(
  "/events",
  asyncHandler(async (req, res) => {
    const status = req.query.status;
    const where = status === "ready" ? { status: "ready" as const } : {};
    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "desc" },
    });
    const data = await Promise.all(
      events.map(async (event) => serializeEvent(event, await eventCounts(event.id))),
    );
    res.json(data);
  }),
);

publicRouter.get(
  "/events/:idOrSlug",
  asyncHandler(async (req, res) => {
    const { idOrSlug } = req.params;
    const event = await prisma.event.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
    if (!event) throw new ApiError(404, "Event tidak ditemukan.");
    res.json(serializeEvent(event, await eventCounts(event.id)));
  }),
);

publicRouter.get(
  "/events/:eventId/classes",
  asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const classes = await prisma.raceClass.findMany({
      where: { eventId },
      orderBy: { order: "asc" },
    });
    const grouped = await prisma.catalog.groupBy({
      by: ["classId"],
      where: { eventId, published: true },
      _count: { _all: true },
    });
    const countMap = new Map(grouped.map((row) => [row.classId, row._count._all]));
    res.json(classes.map((item) => serializeClass(item, countMap.get(item.id) ?? 0)));
  }),
);

publicRouter.get(
  "/classes/:classId",
  asyncHandler(async (req, res) => {
    const raceClass = await prisma.raceClass.findUnique({
      where: { id: req.params.classId },
    });
    if (!raceClass) throw new ApiError(404, "Kelas tidak ditemukan.");
    res.json(serializeClass(raceClass, await classCatalogCount(raceClass.id)));
  }),
);

publicRouter.get(
  "/catalogs",
  asyncHandler(async (req, res) => {
    const eventId = typeof req.query.eventId === "string" ? req.query.eventId : undefined;
    const classId = typeof req.query.classId === "string" ? req.query.classId : undefined;
    const query = typeof req.query.query === "string" ? req.query.query.trim() : "";

    const catalogs = await prisma.catalog.findMany({
      where: {
        published: true,
        ...(eventId ? { eventId } : {}),
        ...(classId ? { classId } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" as const } },
                {
                  photos: {
                    some: {
                      OR: [
                        { bibNumber: { contains: query } },
                        { startNumber: { contains: query } },
                        { motorNumber: { contains: query } },
                      ],
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(catalogs.map(serializeCatalog));
  }),
);

publicRouter.get(
  "/catalogs/:catalogId",
  asyncHandler(async (req, res) => {
    const catalog = await prisma.catalog.findUnique({
      where: { id: req.params.catalogId },
    });
    if (!catalog || !catalog.published) throw new ApiError(404, "Katalog tidak ditemukan.");
    res.json(serializeCatalog(catalog));
  }),
);

publicRouter.get(
  "/catalogs/:catalogId/photos",
  asyncHandler(async (req, res) => {
    const photos = await prisma.photo.findMany({
      where: { catalogId: req.params.catalogId },
      orderBy: { sequence: "asc" },
    });
    res.json(photos.map(serializePhoto));
  }),
);

publicRouter.get(
  "/photos/:photoId",
  asyncHandler(async (req, res) => {
    const photo = await prisma.photo.findUnique({ where: { id: req.params.photoId } });
    if (!photo) throw new ApiError(404, "Foto tidak ditemukan.");
    const [catalog, event, raceClass] = await Promise.all([
      prisma.catalog.findUnique({ where: { id: photo.catalogId } }),
      prisma.event.findUnique({ where: { id: photo.eventId } }),
      prisma.raceClass.findUnique({ where: { id: photo.classId } }),
    ]);
    if (!catalog) throw new ApiError(404, "Katalog tidak ditemukan.");
    res.json({
      photo: serializePhoto(photo),
      catalog: serializeCatalog(catalog),
      event: event ? serializeEvent(event, await eventCounts(event.id)) : undefined,
      raceClass: raceClass
        ? serializeClass(raceClass, await classCatalogCount(raceClass.id))
        : undefined,
    });
  }),
);

publicRouter.get(
  "/search",
  asyncHandler(async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) {
      res.json([]);
      return;
    }
    const photos = await prisma.photo.findMany({
      where: {
        published: true,
        catalog: { published: true },
        OR: [
          { bibNumber: { contains: query } },
          { startNumber: { contains: query } },
          { motorNumber: { contains: query } },
        ],
      },
      orderBy: { sequence: "asc" },
    });

    const catalogIds = [...new Set(photos.map((photo) => photo.catalogId))];
    const catalogs = await prisma.catalog.findMany({
      where: { id: { in: catalogIds } },
    });
    const catalogMap = new Map(catalogs.map((catalog) => [catalog.id, catalog]));

    const results = [];
    for (const catalogId of catalogIds) {
      const catalog = catalogMap.get(catalogId);
      if (!catalog) continue;
      const [event, raceClass] = await Promise.all([
        prisma.event.findUnique({ where: { id: catalog.eventId } }),
        prisma.raceClass.findUnique({ where: { id: catalog.classId } }),
      ]);
      results.push({
        catalog: serializeCatalog(catalog),
        photos: photos
          .filter((photo) => photo.catalogId === catalogId)
          .map(serializePhoto),
        event: event ? serializeEvent(event, await eventCounts(event.id)) : undefined,
        raceClass: raceClass
          ? serializeClass(raceClass, await classCatalogCount(raceClass.id))
          : undefined,
      });
    }
    res.json(results);
  }),
);

const voucherSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().nonnegative(),
});

export async function resolveVoucher(code: string, subtotal: number) {
  const voucher = await prisma.voucher.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!voucher) return { valid: false, message: "Kode voucher tidak ditemukan.", discount: 0 };
  const now = Date.now();
  if (
    !voucher.active ||
    now < voucher.startDate.getTime() ||
    now > voucher.endDate.getTime()
  ) {
    return { valid: false, message: "Voucher sudah tidak berlaku.", discount: 0 };
  }
  if (voucher.used >= voucher.maxUsage) {
    return { valid: false, message: "Kuota voucher sudah habis.", discount: 0 };
  }
  if (subtotal < voucher.minTransaction) {
    return {
      valid: false,
      message: "Minimum transaksi belum terpenuhi untuk voucher ini.",
      discount: 0,
    };
  }
  const discount =
    voucher.discountType === "percent"
      ? Math.round((subtotal * voucher.discountValue) / 100)
      : Math.min(voucher.discountValue, subtotal);
  return {
    valid: true,
    message: `Voucher ${voucher.code} berhasil digunakan.`,
    discount,
    voucher: serializeVoucher(voucher),
  };
}

publicRouter.post(
  "/vouchers/validate",
  asyncHandler(async (req, res) => {
    const parsed = voucherSchema.parse(req.body);
    res.json(await resolveVoucher(parsed.code, parsed.subtotal));
  }),
);

const createOrderSchema = z.object({
  email: z.string().email(),
  whatsapp: z.string().min(6),
  paymentMethod: z.enum(["qris", "bank_transfer", "ewallet"]),
  voucherCode: z.string().optional(),
  items: z
    .array(z.object({ catalogId: z.string().min(1), photoId: z.string().min(1) }))
    .min(1),
});

publicRouter.post(
  "/orders",
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);

    const photos = await prisma.photo.findMany({
      where: { id: { in: input.items.map((item) => item.photoId) } },
    });
    const photoMap = new Map<string, Photo>(photos.map((photo) => [photo.id, photo]));
    const catalogIds = [...new Set(input.items.map((item) => item.catalogId))];
    const catalogs = await prisma.catalog.findMany({
      where: { id: { in: catalogIds } },
    });
    const catalogMap = new Map<string, Catalog>(catalogs.map((catalog) => [catalog.id, catalog]));

    for (const item of input.items) {
      const photo = photoMap.get(item.photoId);
      const catalog = catalogMap.get(item.catalogId);
      if (!photo || !catalog || photo.catalogId !== item.catalogId) {
        throw new ApiError(400, "Item pesanan tidak valid.");
      }
    }

    const subtotal = input.items.reduce((total, item) => {
      const catalog = catalogMap.get(item.catalogId);
      return total + (catalog?.price ?? 0);
    }, 0);

    let discount = 0;
    if (input.voucherCode) {
      const result = await resolveVoucher(input.voucherCode, subtotal);
      if (!result.valid) throw new ApiError(400, result.message);
      discount = result.discount;
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const items = input.items.map((item, index) => {
      const catalog = catalogMap.get(item.catalogId)!;
      const photo = photoMap.get(item.photoId)!;
      return {
        id: `${orderId}-item-${index + 1}`,
        catalogId: catalog.id,
        photoId: photo.id,
        title: catalog.title,
        variant: photo.variant,
        price: catalog.price,
        previewSheetId: photo.previewSheetId,
      };
    });

    const order = await prisma.order.create({
      data: {
        id: orderId,
        buyerEmail: input.email,
        buyerWhatsapp: input.whatsapp,
        voucherCode: input.voucherCode?.toUpperCase(),
        subtotal,
        discount,
        total: Math.max(0, subtotal - discount),
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        items: { create: items },
      },
      include: { items: true },
    });

    res.status(201).json(serializeOrder(order));
  }),
);

publicRouter.get(
  "/orders/:orderId",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { items: true },
    });
    if (!order) throw new ApiError(404, "Pesanan tidak ditemukan.");
    res.json(serializeOrder(order));
  }),
);

async function grantEntitlements(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  await Promise.all(
    items.map((item: { photoId: string }) =>
      prisma.downloadEntitlement.upsert({
        where: { id: `ent-${orderId}-${item.photoId}` },
        update: { accessStatus: "active" },
        create: {
          id: `ent-${orderId}-${item.photoId}`,
          orderId,
          photoId: item.photoId,
          accessStatus: "active",
        },
      }),
    ),
  );
}

publicRouter.post(
  "/orders/:orderId/pay",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { paymentStatus: "paid", paidAt: new Date() },
      include: { items: true },
    });
    await grantEntitlements(order.id);
    res.json(serializeOrder(order));
  }),
);

publicRouter.post(
  "/orders/:orderId/cancel",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { paymentStatus: "cancelled" },
      include: { items: true },
    });
    res.json(serializeOrder(order));
  }),
);

publicRouter.get(
  "/orders/:orderId/downloads",
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { items: true },
    });
    if (!order) throw new ApiError(404, "Pesanan tidak ditemukan.");
    if (order.paymentStatus !== "paid") {
      throw new ApiError(403, "Foto original hanya tersedia setelah pembayaran terverifikasi.");
    }
    res.json({ order: serializeOrder(order), items: order.items.map((item: { id: string; catalogId: string; photoId: string; title: string; variant: string; price: number; previewSheetId: string }) => ({
      id: item.id,
      catalogId: item.catalogId,
      photoId: item.photoId,
      title: item.title,
      variant: item.variant,
      price: item.price,
      previewSheetId: item.previewSheetId,
    })) });
  }),
);
