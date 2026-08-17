import fs from "node:fs";
import path from "node:path";
import PartyPage from "./components/PartyPage";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getPhotos() {
  const imagesDir = path.join(process.cwd(), "public", "images");
  if (!fs.existsSync(imagesDir)) return [];
  const files = fs.readdirSync(imagesDir);

  return files
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => ({
      id: file,
      src: `/images/${file}`,
      name: file,
    }));
}

export default function Home() {
  const photos = getPhotos();
  return <PartyPage photos={photos} />;
}
