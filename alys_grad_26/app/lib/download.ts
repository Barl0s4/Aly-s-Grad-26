import type { Photo } from "../types";

export function triggerDownload(src: string, name: string) {
  const a = document.createElement("a");
  a.href = src;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// On phones, the native share sheet's "Save Image" option saves straight
// into Photos/Gallery — the `download` attribute instead saves to
// Files/Downloads, which most guests don't expect. Try sharing first;
// fall back to a direct download anywhere sharing isn't available
// (desktop browsers, or if the user backs out of the share sheet).
export async function downloadFile(src: string, name: string) {
  const res = await fetch(src);
  const blob = await res.blob();
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      // any other share failure falls through to a direct download
    }
  }

  const url = URL.createObjectURL(file);
  triggerDownload(url, name);
  URL.revokeObjectURL(url);
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
      const res = await fetch(photo.downloadSrc ?? photo.src);
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
