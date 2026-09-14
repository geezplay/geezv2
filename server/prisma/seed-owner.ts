import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD ?? "";
  const name = process.env.OWNER_NAME ?? "Owner GeezPlay";

  if (!email || password.length < 6) {
    console.error(
      "Set OWNER_EMAIL dan OWNER_PASSWORD (minimal 6 karakter) sebelum menjalankan seed owner.",
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash, role: "owner", active: true },
    create: {
      id: `adm-${Date.now().toString(36)}`,
      name,
      email,
      passwordHash,
      role: "owner",
      active: true,
    },
  });

  const settings: Record<string, string> = {
    siteName: "GeezPlay",
    brandName: "GeezPlay",
    logoUrl: "",
    supportEmail: "halo@geezplay.id",
    supportWhatsapp: "",
    watermarkText: "GEEZPLAY",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    qrisEnabled: "true",
    bankTransferEnabled: "true",
    ewalletEnabled: "true",
    downloadLinkTtlMinutes: "15",
    maxUploadSizeMb: "25",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log(`Owner admin siap: ${user.email} (role: ${user.role})`);
  console.log("Data demo tidak dibuat. Login di /admin/login.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
