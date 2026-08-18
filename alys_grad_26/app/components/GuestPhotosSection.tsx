"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import type { Photo } from "../types";
import { downloadFile } from "../lib/download";
import Lightbox from "./Lightbox";
import RevealOnScroll from "./RevealOnScroll";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

export default function GuestPhotosSection({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || !fileList.length) return;
    const files = Array.from(fileList);
    setError(null);

    const tooBig = files.filter((f) => f.size > MAX_UPLOAD_BYTES);
    const wrongType = files.filter((f) => f.type && !ACCEPTED_TYPES.has(f.type));
    const valid = files.filter(
      (f) => f.size <= MAX_UPLOAD_BYTES && (!f.type || ACCEPTED_TYPES.has(f.type))
    );

    if (tooBig.length) {
      setError(`${tooBig.length} file(s) skipped — each photo must be under 25MB.`);
    } else if (wrongType.length) {
      setError(`${wrongType.length} file(s) skipped — only photos are accepted.`);
    }

    if (!valid.length) return;

    setUploading(true);
    setProgress({ done: 0, total: valid.length });

    for (const file of valid) {
      try {
        const result = await upload(`guest-photos/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/guest-upload",
        });
        setPhotos((prev) => [{ id: result.pathname, src: result.url, name: file.name }, ...prev]);
      } catch {
        setError("Something went wrong uploading one of your photos. Please try again.");
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setUploading(false);
  }

  const lightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section id="upload" style={{ padding: "var(--space-6)", maxWidth: 1180, margin: "0 auto" }}>
      <hr className="hr" style={{ marginTop: 0 }} />
      <h2>Got shots of your own?</h2>
      <p className="text-muted" style={{ maxWidth: 520 }}>
        Drop in whatever you captured &mdash; it&rsquo;ll show up right here for everyone else at
        the party.
      </p>

      <label
        htmlFor="gp-file-input"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
          border: "1.5px dashed var(--color-divider)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8)",
          cursor: "pointer",
          marginTop: "var(--space-3)",
        }}
      >
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 20 }}>
          {uploading ? `Uploading ${progress.done}/${progress.total}…` : "+ Add your photos"}
        </span>
        <span className="text-muted" style={{ fontSize: 13 }}>
          JPG, PNG, or HEIC &mdash; up to 25MB each, straight from your phone
        </span>
      </label>
      <input
        ref={inputRef}
        id="gp-file-input"
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />

      {error && (
        <p style={{ color: "var(--color-accent)", fontSize: 13, marginTop: "var(--space-2)" }}>
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <div className="gallery-grid" style={{ marginTop: "var(--space-4)" }}>
          {photos.map((photo, i) => (
            <RevealOnScroll key={photo.id}>
              <div
                className="gp-grid-item plate"
                style={{ margin: 0, position: "relative", cursor: "zoom-in" }}
              >
                <div
                  className="gp-tile-image"
                  onClick={() => setLightboxIndex(i)}
                  style={{ width: "100%", overflow: "hidden", position: "relative", minHeight: 165 }}
                >
                  <Image
                    src={photo.src}
                    alt="Guest submitted photo"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      )}

      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))}
          onNext={() => setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length))}
          onDownload={() => downloadFile(lightboxPhoto.src, lightboxPhoto.name)}
        />
      )}
    </section>
  );
}
