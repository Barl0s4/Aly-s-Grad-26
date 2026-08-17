import type { Photo } from "../types";

export function triggerDownload(src: string, name: string) {
  const a = document.createElement("a");
  a.href = src;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function zipAndDownload(
  photos: Photo[],
  filename: string,
  onProgress?: (done: number, total: number) => void
) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  let done = 0;
  for (const photo of photos) {
    try {
      const res = await fetch(photo.src);
      const blob = await res.blob();
      zip.file(photo.name, blob);
    } catch {
      // skip any photo that fails to fetch
    }
    done += 1;
    onProgress?.(done, photos.length);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}
