"use client";

import { useMemo, useState } from "react";
import type { Photo } from "../types";
import { downloadFile, zipAndDownload } from "../lib/download";
import Nav from "./Nav";
import Hero from "./Hero";
import DetailsSection from "./DetailsSection";
import Gallery from "./Gallery";
import Lightbox from "./Lightbox";
import GuestPhotosSection from "./GuestPhotosSection";
import Footer from "./Footer";

const HERO_PHOTO_ID = "DSCF1129.jpg";

export default function PartyPage({
  photos,
  guestPhotos,
}: {
  photos: Photo[];
  guestPhotos: Photo[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zippingAll, setZippingAll] = useState(false);
  const [zippingSelected, setZippingSelected] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ done: number; total: number } | null>(null);

  const heroPhoto = useMemo(
    () => photos.find((p) => p.id === HERO_PHOTO_ID) ?? photos[0],
    [photos]
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(photos.map((p) => p.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function toggleSelectionMode() {
    setSelectionMode((prev) => {
      if (prev) clearSelection();
      return !prev;
    });
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function nextPhoto() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }

  function prevPhoto() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
  }

  function downloadOne(photo: Photo) {
    downloadFile(photo.downloadSrc ?? photo.src, photo.name);
  }

  async function downloadSelected() {
    const chosen = photos.filter((p) => selected.has(p.id));
    if (!chosen.length) return;
    setZippingSelected(true);
    setZipProgress({ done: 0, total: chosen.length });
    try {
      await zipAndDownload(chosen, "allysa-grad-party-selected.zip", (done, total) =>
        setZipProgress({ done, total })
      );
    } finally {
      setZippingSelected(false);
      setZipProgress(null);
    }
  }

  async function downloadAll() {
    setZippingAll(true);
    setZipProgress({ done: 0, total: photos.length });
    try {
      await zipAndDownload(photos, "allysa-grad-party-all-photos.zip", (done, total) =>
        setZipProgress({ done, total })
      );
    } finally {
      setZippingAll(false);
      setZipProgress(null);
    }
  }

  const lightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;
  const zipping = zippingAll || zippingSelected;

  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text)", minHeight: "100vh" }}>
      <Nav />
      {heroPhoto && (
        <Hero
          heroPhoto={heroPhoto}
          onDownloadAll={downloadAll}
          zipping={zipping}
          downloadAllLabel={
            zippingAll && zipProgress
              ? `Zipping ${zipProgress.done}/${zipProgress.total}…`
              : zippingAll
                ? "Zipping…"
                : "Download all"
          }
        />
      )}
      <DetailsSection />
      <Gallery
        photos={photos}
        selected={selected}
        selectionMode={selectionMode}
        onToggleSelectionMode={toggleSelectionMode}
        onToggleSelect={toggleSelect}
        onOpen={openLightbox}
        onDownloadOne={downloadOne}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onDownloadSelected={downloadSelected}
        zipping={zipping}
        downloadSelectedLabel={
          zippingSelected && zipProgress
            ? `Zipping ${zipProgress.done}/${zipProgress.total}…`
            : zippingSelected
              ? "Zipping…"
              : "Download selected"
        }
      />
      <GuestPhotosSection initialPhotos={guestPhotos} />
      <Footer />
      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          onDownload={() => downloadOne(lightboxPhoto)}
        />
      )}
    </div>
  );
}
