import { PrismaClient, type PaymentMethod, type PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EVENT_SEEDS = [
  {
    id: "evt-kejurnas-sentul",
    slug: "kejurnas-road-race-sentul-2026",
    name: "Kejurnas Road Race Seri 1 2026",
    date: "2026-03-14",
    location: "Sirkuit Sentul, Bogor",
    status: "ready" as const,
    description:
      "Seri pembuka Kejurnas Road Race dengan lebih dari 180 pembalap dari seluruh Indonesia.",
    seed: 11,
  },
  {
    id: "evt-drag-bike-bogor",
    slug: "drag-bike-bogor-maret-2026",
    name: "Bogor Drag Bike Championship",
    date: "2026-02-22",
    location: "Sirkuit Padjajaran, Bogor",
    status: "ready" as const,
    description:
      "Ajang balap drag bike 201 meter yang mempertemukan tim-tim terbaik Jabodetabek.",
    seed: 27,
  },
  {
    id: "evt-yamaha-cup-bekasi",
    slug: "yamaha-cup-bekasi-2026",
    name: "Yamaha Cup Bekasi 2026",
    date: "2026-04-05",
    location: "Margo City Circuit, Bekasi",
    status: "ready" as const,
    description:
      "Balapan one make race Yamaha Cup yang diikuti kelas pemula hingga expert.",
    seed: 43,
  },
  {
    id: "evt-mx-championship-malang",
    slug: "mx-championship-malang-2026",
    name: "Motocross Championship Malang",
    date: "2026-01-18",
    location: "Sirkuit MX Malang, Jawa Timur",
    status: "draft" as const,
    description:
      "Seri motocross lintas alam dengan medan tanjakan dan lumpur yang menantang.",
    seed: 59,
  },
];

const CLASS_NAMES = [
  "Matic 150cc Open",
  "Bebek 125cc Pemula",
  "Sport 250cc Pro",
  "Matic 130cc Rookie",
  "Bebek 150cc Open",
  "Sport 150cc Novice",
  "Matic 160cc Expert",
];

const CATALOG_TITLE_PARTS = [
  "Start Grid",
  "Aksi Tikungan",
  "Sesi Latihan",
  "Finish Line",
  "Papan Grid",
  "Wheelie",
  "Braking Point",
  "Pit Stop",
];

const VARIANTS = [
  { label: "Digital HD", multiplier: 1 },
  { label: "Digital Original", multiplier: 1.6 },
  { label: "Paket Cetak + Digital", multiplier: 2.4 },
];

type SeedPhoto = {
  id: string;
  catalogId: string;
  eventId: string;
  classId: string;
  previewSheetId: string;
  sequence: number;
  bibNumber: string;
  startNumber: string;
  motorNumber: string;
  ocrConfidence: number;
  variant: string;
};

type SeedCatalog = {
  id: string;
  eventId: string;
  classId: string;
  title: string;
  price: number;
  previewSheetId: string;
  photoCount: number;
};

function generate() {
  const classes: Array<{
    id: string;
    eventId: string;
    name: string;
    status: "ready";
    order: number;
  }> = [];
  const catalogs: SeedCatalog[] = [];
  const photos: SeedPhoto[] = [];

  for (const seed of EVENT_SEEDS) {
    const random = mulberry32(seed.seed);
    const classTotal = 3 + Math.floor(random() * 3);
    for (let i = 0; i < classTotal; i += 1) {
      classes.push({
        id: `${seed.id}-cls-${i + 1}`,
        eventId: seed.id,
        name: CLASS_NAMES[i % CLASS_NAMES.length],
        status: "ready",
        order: i + 1,
      });
    }
  }

  for (const raceClass of classes) {
    const random = mulberry32(raceClass.order * 131 + raceClass.eventId.length * 17);
    const catalogTotal = 2 + Math.floor(random() * 4);
    for (let i = 0; i < catalogTotal; i += 1) {
      const catalogId = `${raceClass.id}-cat-${i + 1}`;
      const photoTotal = 4 + Math.floor(random() * 7);
      const variant = VARIANTS[Math.floor(random() * VARIANTS.length)];
      const basePrice = 25000 + Math.floor(random() * 8) * 5000;
      const title = `${CATALOG_TITLE_PARTS[(i + raceClass.order) % CATALOG_TITLE_PARTS.length]} ${
        i + 1
      } - ${raceClass.name}`;
      const price = Math.round((basePrice * variant.multiplier) / 1000) * 1000;

      catalogs.push({
        id: catalogId,
        eventId: raceClass.eventId,
        classId: raceClass.id,
        title,
        price,
        previewSheetId: `${catalogId}:${photoTotal}`,
        photoCount: photoTotal,
      });

      for (let p = 0; p < photoTotal; p += 1) {
        const bib = 1 + Math.floor(random() * 240);
        photos.push({
          id: `${catalogId}-foto-${String(p + 1).padStart(2, "0")}`,
          catalogId,
          eventId: raceClass.eventId,
          classId: raceClass.id,
          previewSheetId: `${catalogId}:${photoTotal}`,
          sequence: p + 1,
          bibNumber: String(bib),
          startNumber: String(100 + bib),
          motorNumber: String(1 + Math.floor(random() * 99)),
          ocrConfidence: Math.round((0.72 + random() * 0.27) * 100) / 100,
          variant: variant.label,
        });
      }
    }
  }

  return { classes, catalogs, photos };
}

const generated = generate();
const catalogById = new Map(generated.catalogs.map((catalog) => [catalog.id, catalog]));
const photosByCatalog = new Map<string, SeedPhoto[]>();
for (const photo of generated.photos) {
  const list = photosByCatalog.get(photo.catalogId) ?? [];
  list.push(photo);
  photosByCatalog.set(photo.catalogId, list);
}

const eventNameById = new Map(EVENT_SEEDS.map((event) => [event.id, event.name]));

function buildOrderItems(orderId: string, catalogId: string, count: number) {
  const catalog = catalogById.get(catalogId);
  const photos = (photosByCatalog.get(catalogId) ?? []).slice(0, count);
  if (!catalog) return [];
  return photos.map((photo, index) => ({
    id: `${orderId}-item-${index + 1}`,
    catalogId,
    photoId: photo.id,
    title: catalog.title,
    variant: photo.variant,
    price: catalog.price,
    previewSheetId: catalog.previewSheetId,
  }));
}

const STATUS_POOL: PaymentStatus[] = [
  "paid",
  "paid",
  "paid",
  "paid",
  "paid",
  "paid",
  "paid",
  "pending",
  "pending",
  "failed",
  "expired",
  "cancelled",
];
const METHODS: PaymentMethod[] = ["qris", "bank_transfer", "ewallet"];

function buildAnalyticsOrders() {
  const random = mulberry32(20260313);
  const rows = [];
  for (let i = 0; i < 64; i += 1) {
    const catalog = generated.catalogs[Math.floor(random() * generated.catalogs.length)];
    const itemCount = 1 + Math.floor(random() * 4);
    const status = STATUS_POOL[Math.floor(random() * STATUS_POOL.length)];
    const method = METHODS[Math.floor(random() * METHODS.length)];
    const daysAgo = Math.floor(random() * 44);
    const created = new Date();
    created.setDate(created.getDate() - daysAgo);
    created.setHours(8 + Math.floor(random() * 12), Math.floor(random() * 60), 0, 0);
    const items = buildOrderItems(`ord-gen-${i + 1}`, catalog.id, itemCount);
    const subtotal = catalog.price * items.length;
    const id = `ORD-2026${String(1000 + i).padStart(4, "0")}`;
    rows.push({
      id,
      buyerEmail: `pembeli${i + 1}@example.com`,
      buyerWhatsapp: `08${String(1000000000 + Math.floor(random() * 899999999)).slice(0, 10)}`,
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod: method,
      paymentStatus: status,
      createdAt: created,
      paidAt: status === "paid" ? created : null,
      items: buildOrderItems(id, catalog.id, itemCount),
    });
  }
  return rows;
}

async function main() {
  console.log("Membersihkan data lama…");
  await prisma.downloadEntitlement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.catalog.deleteMany();
  await prisma.raceClass.deleteMany();
  await prisma.event.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Membuat event, kelas, katalog, foto…");
  await prisma.event.createMany({
    data: EVENT_SEEDS.map((event) => ({
      id: event.id,
      slug: event.slug,
      name: event.name,
      date: new Date(`${event.date}T00:00:00+07:00`),
      location: event.location,
      status: event.status,
      description: event.description,
    })),
  });
  await prisma.raceClass.createMany({ data: generated.classes });
  await prisma.catalog.createMany({ data: generated.catalogs });
  await prisma.photo.createMany({ data: generated.photos });

  console.log("Membuat voucher…");
  await prisma.voucher.createMany({
    data: [
      {
        code: "GEAR10",
        description: "Diskon 10% untuk semua pembelian.",
        discountType: "percent",
        discountValue: 10,
        minTransaction: 0,
        maxUsage: 500,
        used: 128,
        startDate: new Date("2026-01-01T00:00:00+07:00"),
        endDate: new Date("2026-12-31T23:59:59+07:00"),
        active: true,
      },
      {
        code: "HEMAT25K",
        description: "Potongan Rp25.000 dengan minimum transaksi Rp150.000.",
        discountType: "fixed",
        discountValue: 25000,
        minTransaction: 150000,
        maxUsage: 200,
        used: 43,
        startDate: new Date("2026-02-01T00:00:00+07:00"),
        endDate: new Date("2026-06-30T23:59:59+07:00"),
        active: true,
      },
      {
        code: "NEWBIE",
        description: "Diskon 15% khusus pembeli baru, minimum Rp100.000.",
        discountType: "percent",
        discountValue: 15,
        minTransaction: 100000,
        maxUsage: 100,
        used: 100,
        startDate: new Date("2026-01-01T00:00:00+07:00"),
        endDate: new Date("2026-03-31T23:59:59+07:00"),
        active: false,
      },
    ],
  });

  console.log("Membuat contoh order demo…");
  const demoOrders = [
    {
      id: "ORD-PAID-001",
      buyerEmail: "pembalap@example.com",
      buyerWhatsapp: "081234567890",
      voucherCode: "GEAR10",
      paymentMethod: "qris" as PaymentMethod,
      paymentStatus: "paid" as PaymentStatus,
      createdAt: new Date("2026-03-15T08:30:00+07:00"),
      paidAt: new Date("2026-03-15T08:34:00+07:00"),
      items: buildOrderItems("ORD-PAID-001", generated.catalogs[0].id, 2),
    },
    {
      id: "ORD-PENDING-002",
      buyerEmail: "raider@example.com",
      buyerWhatsapp: "081298765432",
      paymentMethod: "bank_transfer" as PaymentMethod,
      paymentStatus: "pending" as PaymentStatus,
      createdAt: new Date("2026-03-16T10:05:00+07:00"),
      paidAt: null,
      items: buildOrderItems("ORD-PENDING-002", generated.catalogs[3].id, 1),
    },
    {
      id: "ORD-FAILED-003",
      buyerEmail: "crew@example.com",
      buyerWhatsapp: "082112345678",
      paymentMethod: "ewallet" as PaymentMethod,
      paymentStatus: "failed" as PaymentStatus,
      createdAt: new Date("2026-03-16T11:20:00+07:00"),
      paidAt: null,
      items: buildOrderItems("ORD-FAILED-003", generated.catalogs[5].id, 1),
    },
  ];

  for (const order of demoOrders) {
    const subtotal = order.items.reduce((total, item) => total + item.price, 0);
    const discount =
      order.voucherCode === "GEAR10" ? Math.round(subtotal * 0.1) : 0;
    await prisma.order.create({
      data: {
        id: order.id,
        buyerEmail: order.buyerEmail,
        buyerWhatsapp: order.buyerWhatsapp,
        voucherCode: order.voucherCode,
        subtotal,
        discount,
        total: subtotal - discount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        items: { create: order.items },
      },
    });
  }

  console.log("Membuat data order historis (dashboard & laporan)…");
  for (const order of buildAnalyticsOrders()) {
    await prisma.order.create({
      data: {
        id: order.id,
        buyerEmail: order.buyerEmail,
        buyerWhatsapp: order.buyerWhatsapp,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        items: { create: order.items },
      },
    });
  }

  console.log("Membuat entitlement untuk order paid…");
  const paidOrders = await prisma.order.findMany({
    where: { paymentStatus: "paid" },
    include: { items: true },
  });
  const entitlements = paidOrders.flatMap((order) =>
    order.items.map((item) => ({
      id: `ent-${order.id}-${item.photoId}`,
      orderId: order.id,
      photoId: item.photoId,
      accessStatus: "active" as const,
      createdAt: order.paidAt ?? order.createdAt,
    })),
  );
  if (entitlements.length > 0) {
    await prisma.downloadEntitlement.createMany({ data: entitlements });
  }

  console.log("Membuat admin…");
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.createMany({
    data: [
      {
        id: "adm-01",
        name: "Rizky Pratama",
        email: "owner@geezplay.id",
        passwordHash,
        role: "owner",
        active: true,
        lastLogin: new Date("2026-03-16T09:12:00+07:00"),
      },
      {
        id: "adm-02",
        name: "Dewi Lestari",
        email: "editor@geezplay.id",
        passwordHash,
        role: "editor",
        active: true,
        lastLogin: new Date("2026-03-15T18:40:00+07:00"),
      },
      {
        id: "adm-03",
        name: "Bagas Nugroho",
        email: "staff@geezplay.id",
        passwordHash,
        role: "staff",
        active: true,
        lastLogin: new Date("2026-03-14T11:05:00+07:00"),
      },
      {
        id: "adm-04",
        name: "Sinta Maharani",
        email: "sinta@geezplay.id",
        passwordHash,
        role: "editor",
        active: false,
        lastLogin: new Date("2026-02-28T08:30:00+07:00"),
      },
    ],
  });

  console.log("Menyimpan pengaturan…");
  const settings: Record<string, string> = {
    siteName: "GeezPlay",
    brandName: "GeezPlay",
    logoUrl: "",
    supportEmail: "halo@geezplay.id",
    supportWhatsapp: "081234567890",
    watermarkText: "GEEZPLAY",
    bankName: "Bank Mandiri",
    bankAccount: "1370099887766",
    bankHolder: "GeezPlay Digital",
    qrisEnabled: "true",
    bankTransferEnabled: "true",
    ewalletEnabled: "true",
    downloadLinkTtlMinutes: "15",
    maxUploadSizeMb: "25",
  };
  await prisma.setting.createMany({
    data: Object.entries(settings).map(([key, value]) => ({ key, value })),
  });

  console.log("Selesai. Event:", generated.classes.length, "kelas.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
