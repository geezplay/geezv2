import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { makePreview, makePreviewSheet, type SheetTile } from "../lib/image";
import { originalsDir, previewsDir, sheetsDir } from "../lib/uploads";

async function main() {
  const settingRows = await prisma.setting.findMany();
  const watermark =
    settingRows.find((row: { key: string; value: string }) => row.key === "watermarkText")?.value || "PREVIEW";

  const catalogs = await prisma.catalog.findMany({
    where: { previewSheetUrl: { not: null } },
    include: { photos: { orderBy: { sequence: "asc" } } },
  });

  const stamp = Date.now().toString(36);
  let regenerated = 0;

  for (const catalog of catalogs) {
    const catalogDir = path.join(originalsDir, catalog.id);
    const tiles: SheetTile[] = [];

    for (const photo of catalog.photos) {
      if (!photo.originalPath) continue;
      const filePath = path.join(catalogDir, photo.originalPath);
      if (!fs.existsSync(filePath)) continue;

      const buffer = await fs.promises.readFile(filePath);
      tiles.push({ buffer, label: photo.originalPath });

      const preview = await makePreview(buffer, watermark);
      const previewFile = `${photo.id}-${stamp}.webp`;
      await fs.promises.writeFile(path.join(previewsDir, previewFile), preview);
      const oldPreview = photo.previewUrl?.split("/").pop();
      await prisma.photo.update({
        where: { id: photo.id },
        data: { previewUrl: `/previews/${previewFile}` },
      });
      if (oldPreview && oldPreview !== previewFile) {
        await fs.promises.unlink(path.join(previewsDir, oldPreview)).catch(() => undefined);
      }
    }

    if (tiles.length === 0) continue;

    const sheet = await makePreviewSheet(tiles, watermark);
    const oldSheet = catalog.previewSheetUrl?.split("/").pop();
    const sheetFile = `${catalog.id}-${stamp}.webp`;
    await fs.promises.writeFile(path.join(sheetsDir, sheetFile), sheet);
    await prisma.catalog.update({
      where: { id: catalog.id },
      data: { previewSheetUrl: `/sheets/${sheetFile}` },
    });
    if (oldSheet && oldSheet !== sheetFile) {
      await fs.promises.unlink(path.join(sheetsDir, oldSheet)).catch(() => undefined);
    }

    regenerated += 1;
    console.log(`regenerated ${catalog.id} (${tiles.length} foto) -> ${sheetFile}`);
  }

  console.log(`Selesai. ${regenerated} katalog diperbarui (preview + sheet).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
