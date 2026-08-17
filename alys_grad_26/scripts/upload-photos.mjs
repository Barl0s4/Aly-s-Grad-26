import { list, put } from "@vercel/blob";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const PREFIX = "party-photos/";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// Web-sized re-encode: full-res originals (~15MB, 6240x4160) stay on disk
// untouched; only this compressed copy goes to Blob, to fit the free
// storage tier while still looking sharp on screen and in the lightbox.
const MAX_DIMENSION = 2200;
const JPEG_QUALITY = 82;

function jpgPathname(file) {
  return PREFIX + file.replace(/\.[^.]+$/, "") + ".jpg";
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN. Run with: node --env-file=.env.local scripts/upload-photos.mjs");
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  console.log(`Found ${files.length} local photos in public/images`);

  const existing = await list({ prefix: PREFIX });
  const already = new Set(existing.blobs.map((b) => b.pathname));
  console.log(`${already.size} already uploaded to Blob`);

  let uploaded = 0;
  let skipped = 0;
  let totalBytes = 0;

  for (const file of files) {
    const pathname = jpgPathname(file);
    if (already.has(pathname)) {
      skipped += 1;
      continue;
    }
    const filePath = path.join(IMAGES_DIR, file);
    const buffer = await sharp(filePath)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    await put(pathname, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "image/jpeg",
      cacheControlMaxAge: 31536000,
    });
    uploaded += 1;
    totalBytes += buffer.length;
    console.log(
      `Uploaded (${uploaded + skipped}/${files.length}): ${file} -> ${(buffer.length / 1024 / 1024).toFixed(2)}MB`
    );
  }

  console.log(
    `Done. Uploaded ${uploaded} new (${(totalBytes / 1024 / 1024).toFixed(1)}MB), skipped ${skipped} already-present.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
