import { list, put } from "@vercel/blob";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// Two re-encoded tiers go to Blob; full-res originals (~15MB, 6240x4160)
// never leave disk. "display" is what the grid/lightbox loads (small,
// fast). "download" is what visitors actually save — noticeably sharper
// than display, still a fraction of the original's size.
const TIERS = [
  { prefix: "party-photos/", maxDimension: 2200, quality: 82 },
  { prefix: "party-photos-download/", maxDimension: 3600, quality: 88 },
];

function jpgPathname(prefix, file) {
  return prefix + file.replace(/\.[^.]+$/, "") + ".jpg";
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

  for (const tier of TIERS) {
    const existing = await list({ prefix: tier.prefix });
    const already = new Set(existing.blobs.map((b) => b.pathname));
    console.log(`[${tier.prefix}] ${already.size} already uploaded to Blob`);

    let uploaded = 0;
    let skipped = 0;
    let totalBytes = 0;

    for (const file of files) {
      const pathname = jpgPathname(tier.prefix, file);
      if (already.has(pathname)) {
        skipped += 1;
        continue;
      }
      const filePath = path.join(IMAGES_DIR, file);
      const buffer = await sharp(filePath)
        .rotate()
        .resize({
          width: tier.maxDimension,
          height: tier.maxDimension,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: tier.quality })
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
        `[${tier.prefix}] Uploaded (${uploaded + skipped}/${files.length}): ${file} -> ${(buffer.length / 1024 / 1024).toFixed(2)}MB`
      );
    }

    console.log(
      `[${tier.prefix}] Done. Uploaded ${uploaded} new (${(totalBytes / 1024 / 1024).toFixed(1)}MB), skipped ${skipped} already-present.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
