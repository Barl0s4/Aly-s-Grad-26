"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Photo } from "../types";

type LightboxProps = {
  photo: Photo;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDownload: () => void;
};

export default function Lightbox({ photo, onClose, onPrev, onNext, onDownload }: LightboxProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="dialog-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        padding: "var(--space-4)",
        background: "color-mix(in srgb, var(--color-neutral-900) 55%, transparent)",
        zIndex: 50,
        animation: "fadeIn .15s ease",
      }}
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="lb-icon-btn"
        style={{
          position: "fixed",
          top: "var(--space-4)",
          right: "var(--space-4)",
          fontSize: 24,
          zIndex: 60,
        }}
      >
        &times;
      </button>
      <div
        style={{
          position: "relative",
          maxWidth: "min(900px, 92vw)",
          width: "100%",
          animation: "scaleIn .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <figure className="plate" style={{ margin: 0, position: "relative", height: "min(78vh, 640px)" }}>
          <Image
            src={photo.src}
            alt="Grad party photo, expanded view"
            fill
            sizes="92vw"
            style={{ objectFit: "contain", background: "var(--color-neutral-900)" }}
            priority
          />
        </figure>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "var(--space-3)",
            flexWrap: "wrap",
            gap: "var(--space-2)",
          }}
        >
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              className="lb-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="Previous photo"
            >
              &#8249;
            </button>
            <button
              className="lb-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next photo"
            >
              &#8250;
            </button>
          </div>
          <button
            className="btn lb-download-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
          >
            Download this photo
          </button>
        </div>
      </div>
    </div>
  );
}
