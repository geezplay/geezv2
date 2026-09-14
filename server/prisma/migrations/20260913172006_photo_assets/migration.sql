-- AlterTable
ALTER TABLE "Catalog" ADD COLUMN     "previewSheetUrl" TEXT;

-- AlterTable
ALTER TABLE "Photo" ADD COLUMN     "originalPath" TEXT,
ADD COLUMN     "previewUrl" TEXT;
