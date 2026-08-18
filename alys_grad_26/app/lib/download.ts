import type { Photo } from "../types";

// Sharing many large files at once gets unreliable on some platforms —
// past this count, skip straight to a zip rather than risk the share
// sheet failing on a big "download all" selection.
const MAX_SHARE_FILES = 25;

export function triggerDownload(src: string, name: string) {
  const a = document.createElement("a");
  a.href = src;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function fetchAsFile(src: string, name: string): Promise<File> {
  const res = await fetch(src);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

async function tryShare(files: File[]): Promise<boolean> {
  if (!navigator.share || !navigator.canShare?.({ files })) return false;
  try {
    await navigator.share({ files });
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return true; // user cancelled — don't fall back
    return false;
  }
}

// On phones, the native share sheet's "Save Image(s)" option saves
// straight into Photos/Gallery — the `download` attribute instead saves
// to Files/Downloads, which most guests don't expect. Try sharing first;
// fall back to a direct download anywhere sharing isn't available
// (desktop browsers, or if the share attempt itself fails).
export async function downloadFile(src: string, name: string) {
  const file = await fetchAsFile(src, name);
  if (await tryShare([file])) return;

  const url = URL.createObjectURL(file);
  triggerDownload(url, name);
  URL.revokeObjectURL(url);
}

export async function downloadMany(
  photos: Photo[],
  zipFilename: string,
  onProgress?: (done: number, total: number) => void
) {
  const files: File[] = [];
  let done = 0;
  for (const photo of photos) {
    try {
      files.push(await fetchAsFile(photo.downloadSrc ?? photo.src, photo.name));
    } catch {
      // skip any photo that fails to fetch
    }
    done += 1;
    onProgress?.(done, photos.length);
  }
  if (!files.length) return;

  if (files.length <= MAX_SHARE_FILES && (await tryShare(files))) return;

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  files.forEach((file) => zip.file(file.name, file));

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  triggerDownload(url, zipFilename);
  URL.revokeObjectURL(url);
}
