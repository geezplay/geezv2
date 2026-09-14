import sharp from "sharp";

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

export function watermarkSvg(width: number, height: number, text: string): Buffer {
  const label = escapeXml(text || "PREVIEW");
  const step = Math.max(160, Math.round(width / 3.2));
  const fontSize = Math.max(16, Math.round(step / 7));
  const parts: string[] = [];
  for (let y = -step; y < height + step; y += step) {
    for (let x = -width; x < width * 2; x += step) {
      parts.push(
        `<text x="${x}" y="${y}" fill="#ffffff" fill-opacity="0.16" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="2" transform="rotate(-24 ${x} ${y})">${label} \u00b7 ${label}</text>`,
      );
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${parts.join("")}</svg>`,
  );
}

export async function makePreview(input: Buffer, watermark: string): Promise<Buffer> {
  const rotated = sharp(input).rotate();
  const meta = await rotated.metadata();
  const width = Math.min(meta.width ?? 900, 900);
  const resized = await rotated
    .resize({ width, withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  const svg = watermarkSvg(resized.info.width, resized.info.height, watermark);
  return sharp(resized.data)
    .composite([{ input: svg, blend: "over" }])
    .webp({ quality: 62 })
    .toBuffer();
}

export interface SheetTile {
  buffer: Buffer;
  label: string;
}

function numberSvg(width: number, height: number, value: number): Buffer {
  const text = String(value);
  const fontSize = 52;
  const pillW = text.length > 2 ? 90 : text.length > 1 ? 72 : 56;
  const pillH = 56;
  const x = width - pillW - 10;
  const y = 10;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect x="${x}" y="${y}" width="${pillW}" height="${pillH}" rx="12" fill="#000000" fill-opacity="0.65"/>` +
      `<text x="${x + pillW / 2}" y="${y + 43}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="900" fill="#ffe200" stroke="#000000" stroke-width="3" paint-order="stroke">${value}</text>` +
      `</svg>`,
  );
}

export async function makePreviewSheet(
  tiles: SheetTile[],
  watermark: string,
): Promise<Buffer> {
  const items = tiles.slice(0, 50);
  const count = Math.max(1, items.length);
  const tileW = 400;
  const photoH = 300;
  const captionH = 32;
  const gap = 10;
  const cols = Math.min(5, count);
  const rows = Math.ceil(count / cols);
  const width = cols * tileW + (cols + 1) * gap;
  const height = rows * (photoH + captionH) + (rows + 1) * gap;

  const overlays: sharp.OverlayOptions[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const left = gap + (index % cols) * (tileW + gap);
    const top = gap + Math.floor(index / cols) * (photoH + captionH + gap);

    const photo = await sharp(items[index].buffer)
      .rotate()
      .resize(tileW, photoH, { fit: "cover" })
      .toBuffer();
    overlays.push({ input: photo, left, top });

    const caption = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${tileW}" height="${captionH}">` +
        `<rect width="${tileW}" height="${captionH}" fill="#0b1220"/>` +
        `<text x="12" y="23" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="17">${escapeXml(items[index].label)}</text>` +
        `</svg>`,
    );
    overlays.push({ input: caption, left, top: top + photoH });

    overlays.push({ input: numberSvg(tileW, photoH, index + 1), left, top });
  }

  overlays.push({ input: watermarkSvg(width, height, watermark), blend: "over" });

  return sharp({
    create: { width, height, channels: 3, background: { r: 11, g: 18, b: 32 } },
  })
    .composite(overlays)
    .webp({ quality: 60 })
    .toBuffer();
}
