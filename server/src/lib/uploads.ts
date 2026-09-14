import fs from "node:fs";
import path from "node:path";

const base = process.cwd();

export const uploadsDir = path.join(base, "uploads");
export const originalsDir = path.join(base, "storage", "originals");
export const previewsDir = path.join(base, "storage", "previews");
export const sheetsDir = path.join(base, "storage", "sheets");

for (const dir of [uploadsDir, originalsDir, previewsDir, sheetsDir]) {
  fs.mkdirSync(dir, { recursive: true });
}
