import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import { Prisma, type AdminRole, type PaymentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError, asyncHandler } from "../lib/http";
import { requireAdmin, signAdminToken } from "../lib/auth";
import { makePreview, makePreviewSheet, type SheetTile } from "../lib/image";
import { originalsDir, previewsDir, sheetsDir, uploadsDir } from "../lib/uploads";
import {
  serializeAdminUser,
  serializeCatalog,
  serializeClass,
  serializeEvent,
  serializePhoto,
  serializeSettings,
  serializeVoucher,
} from "../lib/serialize";

export const adminRouter = Router();

const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDir),
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".png";
      callback(null, `logo-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new ApiError(400, "File logo harus berupa gambar."));
      return;
    }
    callback(null, true);
  },
});

const photosUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new ApiError(400, "Semua berkas harus berupa gambar."));
      return;
    }
    callback(null, true);
  },
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

adminRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await prisma.adminUser.findUnique({
      where: { email: input.email.trim().toLowerCase() },
    });
    if (!user || !user.active) {
      throw new ApiError(401, "Email atau password salah, atau akun tidak aktif.");
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Email atau password salah, atau akun tidak aktif.");
    }
    const updated = await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    const token = signAdminToken({
      sub: updated.id,
      email: updated.email,
      role: updated.role,
    });
    res.json({ token, user: serializeAdminUser(updated) });
  }),
);

adminRouter.use((req, res, next) => {
  if (req.path === "/login") return next();
  return requireAdmin(req, res, next);
});

adminRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const admin = (req as typeof req & { admin?: { sub: string } }).admin;
    const user = await prisma.adminUser.findUnique({ where: { id: admin?.sub } });
    if (!user) throw new ApiError(401, "Sesi tidak valid.");
    res.json(serializeAdminUser(user));
  }),
);

adminRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const allOrders = await prisma.order.findMany({
      include: { items: { include: { catalog: { include: { event: true } } } } },
    });
    const paid = allOrders.filter((order) => order.paymentStatus === "paid");
    const revenue = paid.reduce((total, order) => total + order.total, 0);
    const photosSold = paid.reduce((total, order) => total + order.items.length, 0);
    const pendingOrders = allOrders.filter(
      (order) => order.paymentStatus === "pending",
    ).length;
    const settled = allOrders.filter((order) =>
      ["paid", "failed", "expired", "cancelled"].includes(order.paymentStatus),
    ).length;
    const successRate = settled === 0 ? 0 : Math.round((paid.length / settled) * 100);

    const salesByDay = [];
    for (let i = 13; i >= 0; i -= 1) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const dayOrders = paid.filter((order) => {
        const created = order.createdAt;
        return created >= day && created < next;
      });
      salesByDay.push({
        date: day.toISOString(),
        label: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
          day,
        ),
        revenue: dayOrders.reduce((total, order) => total + order.total, 0),
        orders: dayOrders.length,
      });
    }

    const eventMap = new Map<string, { eventName: string; orders: number; photos: number; revenue: number }>();
    for (const order of paid) {
      const name = order.items[0]?.catalog.event.name ?? "Tanpa event";
      const row = eventMap.get(name) ?? { eventName: name, orders: 0, photos: 0, revenue: 0 };
      row.orders += 1;
      row.photos += order.items.length;
      row.revenue += order.total;
      eventMap.set(name, row);
    }
    const topEvents = [...eventMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const statusOrder: PaymentStatus[] = ["paid", "pending", "failed", "expired", "cancelled"];
    const statusBreakdown = statusOrder.map((status) => ({
      status,
      count: allOrders.filter((order) => order.paymentStatus === status).length,
    }));

    const [eventCount, classCount, catalogCount, photoCount] = await Promise.all([
      prisma.event.count(),
      prisma.raceClass.count(),
      prisma.catalog.count(),
      prisma.photo.count(),
    ]);

    res.json({
      revenue,
      orders: allOrders.length,
      paidOrders: paid.length,
      pendingOrders,
      photosSold,
      successRate,
      eventCount,
      classCount,
      catalogCount,
      photoCount,
      salesByDay,
      topEvents,
      statusBreakdown,
      recentOrders: allOrders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 6)
        .map((order) => ({
          id: order.id,
          buyerEmail: order.buyerEmail,
          buyerWhatsapp: order.buyerWhatsapp,
          eventName: order.items[0]?.catalog.event.name ?? "-",
          itemCount: order.items.length,
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt.toISOString(),
        })),
    });
  }),
);

adminRouter.get(
  "/orders",
  asyncHandler(async (_req, res) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: { include: { catalog: { include: { event: true } } } } },
    });
    res.json(
      orders.map((order) => ({
        id: order.id,
        buyerEmail: order.buyerEmail,
        buyerWhatsapp: order.buyerWhatsapp,
        eventName: order.items[0]?.catalog.event.name ?? "-",
        itemCount: order.items.length,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      })),
    );
  }),
);

adminRouter.get(
  "/reports",
  asyncHandler(async (req, res) => {
    const from = typeof req.query.from === "string" && req.query.from ? req.query.from : undefined;
    const to = typeof req.query.to === "string" && req.query.to ? req.query.to : undefined;
    const eventName = typeof req.query.eventName === "string" ? req.query.eventName : "all";
    const status =
      typeof req.query.status === "string" && req.query.status !== "all"
        ? (req.query.status as PaymentStatus)
        : undefined;
    const groupBy = req.query.groupBy === "date" ? "date" : "event";

    const orders = await prisma.order.findMany({
      include: { items: { include: { catalog: { include: { event: true } } } } },
    });

    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;

    const filtered = orders.filter((order) => {
      const created = order.createdAt.getTime();
      if (fromTime && created < fromTime) return false;
      if (toTime && created > toTime) return false;
      const name = order.items[0]?.catalog.event.name ?? "-";
      if (eventName !== "all" && name !== eventName) return false;
      if (status && order.paymentStatus !== status) return false;
      return true;
    });

    const map = new Map<string, { key: string; label: string; orders: number; photos: number; revenue: number }>();
    for (const order of filtered) {
      const name = order.items[0]?.catalog.event.name ?? "-";
      const key = groupBy === "event" ? name : order.createdAt.toISOString().slice(0, 10);
      const label =
        groupBy === "event"
          ? name
          : new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(order.createdAt);
      const row = map.get(key) ?? { key, label, orders: 0, photos: 0, revenue: 0 };
      row.orders += 1;
      row.photos += order.items.length;
      if (order.paymentStatus === "paid") row.revenue += order.total;
      map.set(key, row);
    }

    res.json({
      rows: [...map.values()].sort((a, b) => b.revenue - a.revenue),
      totalOrders: filtered.length,
      totalPhotos: filtered.reduce((total, order) => total + order.items.length, 0),
      totalRevenue: filtered
        .filter((order) => order.paymentStatus === "paid")
        .reduce((total, order) => total + order.total, 0),
      filters: { from, to, eventName, status: status ?? "all", groupBy },
    });
  }),
);

adminRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const rows = await prisma.setting.findMany();
    res.json(serializeSettings(rows));
  }),
);

adminRouter.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const entries = Object.entries(body);
    await Promise.all(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        }),
      ),
    );
    const rows = await prisma.setting.findMany();
    res.json(serializeSettings(rows));
  }),
);

adminRouter.post(
  "/settings/logo",
  logoUpload.single("logo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "File logo tidak ditemukan.");
    const base =
      process.env.PUBLIC_API_URL ?? `${req.protocol}://${req.get("host")}`;
    const url = `${base}/uploads/${req.file.filename}`;
    await prisma.setting.upsert({
      where: { key: "logoUrl" },
      update: { value: url },
      create: { key: "logoUrl", value: url },
    });
    const rows = await prisma.setting.findMany();
    res.json(serializeSettings(rows));
  }),
);

const adminUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["owner", "editor", "staff"]),
});

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });
    res.json(users.map(serializeAdminUser));
  }),
);

adminRouter.post(
  "/users",
  asyncHandler(async (req, res) => {
    const input = adminUserSchema.parse(req.body);
    const exists = await prisma.adminUser.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (exists) throw new ApiError(409, "Email sudah terdaftar.");
    const passwordHash = await bcrypt.hash("admin123", 10);
    const user = await prisma.adminUser.create({
      data: {
        id: `adm-${Date.now().toString(36)}`,
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
        active: true,
      },
    });
    res.status(201).json(serializeAdminUser(user));
  }),
);

adminRouter.patch(
  "/users/:userId",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      active: z.boolean().optional(),
      role: z.enum(["owner", "editor", "staff"]).optional(),
    });
    const input = schema.parse(req.body);
    const user = await prisma.adminUser.update({
      where: { id: req.params.userId },
      data: { active: input.active, role: input.role as AdminRole | undefined },
    });
    res.json(serializeAdminUser(user));
  }),
);

async function eventCounts(eventId: string) {
  const [classCount, catalogCount, photoCount] = await Promise.all([
    prisma.raceClass.count({ where: { eventId } }),
    prisma.catalog.count({ where: { eventId } }),
    prisma.photo.count({ where: { eventId } }),
  ]);
  return { classCount, catalogCount, photoCount };
}

adminRouter.get(
  "/events",
  asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
    res.json(
      await Promise.all(
        events.map(async (event) => serializeEvent(event, await eventCounts(event.id))),
      ),
    );
  }),
);

const eventSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  location: z.string().min(1),
  status: z.enum(["ready", "draft"]),
  description: z.string().optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

adminRouter.post(
  "/events",
  asyncHandler(async (req, res) => {
    const input = eventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: {
        id: `evt-${slugify(input.name)}-${Date.now().toString(36)}`,
        slug: slugify(input.name),
        name: input.name,
        date: new Date(input.date),
        location: input.location,
        status: input.status,
        description: input.description ?? "",
      },
    });
    res.status(201).json(serializeEvent(event, await eventCounts(event.id)));
  }),
);

adminRouter.patch(
  "/events/:eventId",
  asyncHandler(async (req, res) => {
    const input = eventSchema.partial().parse(req.body);
    const event = await prisma.event.update({
      where: { id: req.params.eventId },
      data: {
        name: input.name,
        date: input.date ? new Date(input.date) : undefined,
        location: input.location,
        status: input.status,
        description: input.description,
      },
    });
    res.json(serializeEvent(event, await eventCounts(event.id)));
  }),
);

adminRouter.delete(
  "/events/:eventId",
  asyncHandler(async (req, res) => {
    await prisma.event.delete({ where: { id: req.params.eventId } });
    res.json({ ok: true });
  }),
);

adminRouter.post(
  "/events/:eventId/cover",
  photosUpload.single("cover"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "File brosur tidak ditemukan.");
    const event = await prisma.event.findUnique({
      where: { id: req.params.eventId },
    });
    if (!event) throw new ApiError(404, "Event tidak ditemukan.");

    const fileName = `event-${event.id}-${Date.now().toString(36)}.webp`;
    const cover = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    await fs.promises.writeFile(path.join(uploadsDir, fileName), cover);

    if (event.coverUrl && event.coverUrl.startsWith("/uploads/")) {
      const oldFile = event.coverUrl.split("/").pop();
      if (oldFile) {
        await fs.promises
          .unlink(path.join(uploadsDir, oldFile))
          .catch(() => undefined);
      }
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data: { coverUrl: `/uploads/${fileName}` },
    });
    res.json(serializeEvent(updated, await eventCounts(updated.id)));
  }),
);

adminRouter.get(
  "/classes",
  asyncHandler(async (req, res) => {
    const eventId = typeof req.query.eventId === "string" ? req.query.eventId : undefined;
    const classes = await prisma.raceClass.findMany({
      where: eventId ? { eventId } : {},
      orderBy: [{ eventId: "asc" }, { order: "asc" }],
    });
    const grouped = await prisma.catalog.groupBy({
      by: ["classId"],
      _count: { _all: true },
    });
    const countMap = new Map(grouped.map((row) => [row.classId, row._count._all]));
    res.json(classes.map((item) => serializeClass(item, countMap.get(item.id) ?? 0)));
  }),
);

const classSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(1),
  order: z.number().int().min(1),
  status: z.enum(["ready", "draft"]),
});

adminRouter.post(
  "/classes",
  asyncHandler(async (req, res) => {
    const input = classSchema.parse(req.body);
    const raceClass = await prisma.raceClass.create({
      data: {
        id: `cls-${Date.now().toString(36)}`,
        eventId: input.eventId,
        name: input.name,
        order: input.order,
        status: input.status,
      },
    });
    res.status(201).json(serializeClass(raceClass, 0));
  }),
);

adminRouter.patch(
  "/classes/:classId",
  asyncHandler(async (req, res) => {
    const input = classSchema.partial().parse(req.body);
    const raceClass = await prisma.raceClass.update({
      where: { id: req.params.classId },
      data: {
        eventId: input.eventId,
        name: input.name,
        order: input.order,
        status: input.status,
      },
    });
    const count = await prisma.catalog.count({ where: { classId: raceClass.id } });
    res.json(serializeClass(raceClass, count));
  }),
);

adminRouter.delete(
  "/classes/:classId",
  asyncHandler(async (req, res) => {
    await prisma.raceClass.delete({ where: { id: req.params.classId } });
    res.json({ ok: true });
  }),
);

adminRouter.get(
  "/catalogs",
  asyncHandler(async (req, res) => {
    const eventId = typeof req.query.eventId === "string" ? req.query.eventId : undefined;
    const classId = typeof req.query.classId === "string" ? req.query.classId : undefined;
    const where: Prisma.CatalogWhereInput = {};
    if (eventId) where.eventId = eventId;
    if (classId) where.classId = classId;

    const catalogs = await prisma.catalog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(catalogs.map(serializeCatalog));
  }),
);

const createCatalogSchema = z.object({
  eventId: z.string().min(1),
  classId: z.string().min(1),
  title: z.string().min(1),
  price: z.coerce.number().int().min(0),
});

adminRouter.post(
  "/catalogs",
  asyncHandler(async (req, res) => {
    let payload = req.body;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        // continue
      }
    }
    const input = createCatalogSchema.parse(payload);
    const event = await prisma.event.findUnique({ where: { id: input.eventId } });
    if (!event) throw new ApiError(404, "Event tidak ditemukan.");
    const raceClass = await prisma.raceClass.findUnique({ where: { id: input.classId } });
    if (!raceClass) throw new ApiError(404, "Kelas balap tidak ditemukan.");

    const catalogId = `${input.classId}-cat-${Date.now().toString(36)}`;
    const catalogDir = path.join(originalsDir, catalogId);
    fs.mkdirSync(catalogDir, { recursive: true });

    const catalog = await prisma.catalog.create({
      data: {
        id: catalogId,
        eventId: input.eventId,
        classId: input.classId,
        title: input.title.trim(),
        price: input.price,
        previewSheetId: `${catalogId}:0`,
        photoCount: 0,
        published: true,
      },
    });
    res.status(201).json(serializeCatalog(catalog));
  }),
);

adminRouter.post(
  "/catalogs/:catalogId/photos",
  photosUpload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Tidak ada file foto yang diunggah.");
    const catalog = await prisma.catalog.findUnique({
      where: { id: req.params.catalogId },
    });
    if (!catalog) throw new ApiError(404, "Katalog tidak ditemukan.");

    const settingRows = await prisma.setting.findMany();
    const watermark =
      settingRows.find((row: { key: string; value: string }) => row.key === "watermarkText")?.value || "GEEZPLAY";

    const catalogDir = path.join(originalsDir, catalog.id);
    fs.mkdirSync(catalogDir, { recursive: true });

    const existingCount = await prisma.photo.count({
      where: { catalogId: catalog.id },
    });
    const sequence = existingCount + 1;
    const photoId = `${catalog.id}-foto-${String(sequence).padStart(2, "0")}-${Date.now().toString(36)}`;
    const ext = (path.extname(req.file.originalname) || ".jpg").toLowerCase();
    const originalName = `${photoId}${ext}`;

    await fs.promises.writeFile(path.join(catalogDir, originalName), req.file.buffer);

    const preview = await makePreview(req.file.buffer, watermark);
    const previewFile = `${photoId}.webp`;
    await fs.promises.writeFile(path.join(previewsDir, previewFile), preview);

    const digits = req.file.originalname.match(/\d+/);
    const bib = digits
      ? String(Number(digits[0]) % 1000)
      : String(1 + Math.floor(Math.random() * 240));

    const photo = await prisma.photo.create({
      data: {
        id: photoId,
        catalogId: catalog.id,
        eventId: catalog.eventId,
        classId: catalog.classId,
        previewSheetId: catalog.previewSheetId ?? catalog.id,
        previewUrl: `/previews/${previewFile}`,
        originalPath: originalName,
        sequence,
        bibNumber: bib,
        startNumber: String(100 + Number(bib)),
        motorNumber: String(1 + Math.floor(Math.random() * 99)),
        ocrConfidence: digits ? 0.9 : 0.5,
        variant: req.file.mimetype.replace("image/", "").toUpperCase() || "JPG",
        published: true,
      },
    });

    await prisma.catalog.update({
      where: { id: catalog.id },
      data: { photoCount: { increment: 1 } },
    });

    res.status(201).json(serializePhoto(photo));
  }),
);

adminRouter.get(
  "/classes/:classId/photos",
  asyncHandler(async (req, res) => {
    const photos = await prisma.photo.findMany({
      where: { classId: req.params.classId },
      include: { catalog: true },
      orderBy: [{ catalogId: "asc" }, { sequence: "asc" }],
    });
    res.json(
      photos.map((photo) => ({
        photo: serializePhoto(photo),
        catalog: serializeCatalog(photo.catalog),
      })),
    );
  }),
);

adminRouter.patch(
  "/catalogs/:catalogId",
  asyncHandler(async (req, res) => {
    const schema = z.object({ published: z.boolean().optional() });
    const input = schema.parse(req.body);
    const catalog = await prisma.catalog.update({
      where: { id: req.params.catalogId },
      data: { published: input.published },
    });
    res.json(serializeCatalog(catalog));
  }),
);

adminRouter.get(
  "/vouchers",
  asyncHandler(async (_req, res) => {
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
    res.json(vouchers.map(serializeVoucher));
  }),
);

const voucherSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().int().min(0),
  minTransaction: z.number().int().min(0),
  maxUsage: z.number().int().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

adminRouter.post(
  "/vouchers",
  asyncHandler(async (req, res) => {
    const input = voucherSchema.parse(req.body);
    const code = input.code.trim().toUpperCase();
    const exists = await prisma.voucher.findUnique({ where: { code } });
    if (exists) throw new ApiError(409, "Kode voucher sudah digunakan.");
    const voucher = await prisma.voucher.create({
      data: {
        code,
        description: input.description ?? "Voucher baru.",
        discountType: input.discountType,
        discountValue: input.discountValue,
        minTransaction: input.minTransaction,
        maxUsage: input.maxUsage,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        active: true,
      },
    });
    res.status(201).json(serializeVoucher(voucher));
  }),
);

adminRouter.patch(
  "/vouchers/:code",
  asyncHandler(async (req, res) => {
    const schema = z.object({ active: z.boolean().optional() });
    const input = schema.parse(req.body);
    const voucher = await prisma.voucher.update({
      where: { code: req.params.code },
      data: { active: input.active },
    });
    res.json(serializeVoucher(voucher));
  }),
);

adminRouter.post(
  "/upload",
  photosUpload.array("photos", 20),
  asyncHandler(async (req, res) => {
    const eventId = String(req.body.eventId ?? "");
    const classId = String(req.body.classId ?? "");
    const title = String(req.body.title ?? "").trim();
    const price = Number(req.body.price ?? 0);
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (!eventId || !classId) {
      throw new ApiError(400, "Event dan kelas wajib dipilih.");
    }
    if (!title) {
      throw new ApiError(400, "Judul katalog wajib diisi.");
    }
    if (files.length === 0) {
      throw new ApiError(400, "Tidak ada file foto yang diunggah.");
    }

    const settingRows = await prisma.setting.findMany();
    const watermark =
      settingRows.find((row) => row.key === "watermarkText")?.value || "PREVIEW";

    const catalogId = `${classId}-cat-${Date.now().toString(36)}`;
    const stamp = Date.now().toString(36);
    const catalogDir = path.join(originalsDir, catalogId);
    fs.mkdirSync(catalogDir, { recursive: true });

    const sheetSources: SheetTile[] = [];
    const photoRows: Prisma.PhotoUncheckedCreateWithoutCatalogInput[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const photoId = `${catalogId}-foto-${String(index + 1).padStart(2, "0")}`;
      const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
      const originalName = `${photoId}${ext}`;

      await fs.promises.writeFile(path.join(catalogDir, originalName), file.buffer);

      const preview = await makePreview(file.buffer, watermark);
      const previewFile = `${photoId}-${stamp}.webp`;
      await fs.promises.writeFile(path.join(previewsDir, previewFile), preview);
      sheetSources.push({ buffer: file.buffer, label: file.originalname });

      const digits = file.originalname.match(/\d+/);
      const bib = digits
        ? String(Number(digits[0]) % 1000)
        : String(1 + Math.floor(Math.random() * 240));

      photoRows.push({
        id: photoId,
        eventId,
        classId,
        previewSheetId: `${catalogId}:${files.length}`,
        previewUrl: `/previews/${previewFile}`,
        originalPath: originalName,
        sequence: index + 1,
        bibNumber: bib,
        startNumber: String(100 + Number(bib)),
        motorNumber: String(1 + Math.floor(Math.random() * 99)),
        ocrConfidence: digits ? 0.9 : 0.5,
        variant: file.mimetype.replace("image/", "").toUpperCase() || "JPG",
        published: true,
      });
    }

    const sheet = await makePreviewSheet(sheetSources, watermark);
    const sheetFile = `${catalogId}-${Date.now().toString(36)}.webp`;
    await fs.promises.writeFile(path.join(sheetsDir, sheetFile), sheet);

    const catalog = await prisma.catalog.create({
      data: {
        id: catalogId,
        eventId,
        classId,
        title,
        price,
        previewSheetId: `${catalogId}:${files.length}`,
        previewSheetUrl: `/sheets/${sheetFile}`,
        photoCount: files.length,
        published: true,
        photos: { create: photoRows },
      },
    });
    res.status(201).json(serializeCatalog(catalog));
  }),
);
