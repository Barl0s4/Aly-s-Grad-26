import Image from "next/image";
import type { Photo } from "../types";
import RevealOnScroll from "./RevealOnScroll";

type GalleryProps = {
  photos: Photo[];
  selected: Set<string>;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  onToggleSelect: (id: string) => void;
  onOpen: (index: number) => void;
  onDownloadOne: (photo: Photo) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadSelected: () => void;
  zipping: boolean;
  downloadSelectedLabel: string;
};

export default function Gallery({
  photos,
  selected,
  selectionMode,
  onToggleSelectionMode,
  onToggleSelect,
  onOpen,
  onDownloadOne,
  onSelectAll,
  onClearSelection,
  onDownloadSelected,
  zipping,
  downloadSelectedLabel,
}: GalleryProps) {
  const selectedCount = selected.size;
  const hasSelection = selectedCount > 0;

  return (
    <section id="gallery" style={{ padding: "var(--space-6)", maxWidth: 1180, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "var(--space-3)",
          flexWrap: "wrap",
          marginBottom: "var(--space-4)",
        }}
      >
        <div>
          <h2>The Gallery</h2>
          <p className="text-muted" style={{ margin: 0 }}>
            {photos.length} photos from the day
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
          {selectionMode ? (
            <>
              {hasSelection && <span className="tag tag-accent">{selectedCount} selected</span>}
              <button className="btn btn-ghost" onClick={onSelectAll}>
                Select all
              </button>
              {hasSelection && (
                <button className="btn btn-ghost" onClick={onClearSelection}>
                  Clear
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={onDownloadSelected}
                disabled={zipping || !hasSelection}
              >
                {downloadSelectedLabel}
              </button>
              <button className="btn btn-secondary" onClick={onToggleSelectionMode}>
                Done
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={onToggleSelectionMode}>
              Select photos
            </button>
          )}
        </div>
      </div>

      <div className="gallery-grid">
        {photos.map((photo, i) => {
          const isSel = selected.has(photo.id);
          return (
            <RevealOnScroll key={photo.id}>
            <div
              className="gp-grid-item plate"
              style={{
                margin: 0,
                position: "relative",
                cursor: selectionMode ? "pointer" : "zoom-in",
                outline: isSel ? "3px solid var(--color-accent)" : undefined,
                outlineOffset: isSel ? -3 : undefined,
              }}
            >
              <div
                className="gp-tile-image"
                onClick={() => (selectionMode ? onToggleSelect(photo.id) : onOpen(i))}
                style={{ width: "100%", overflow: "hidden", position: "relative", minHeight: 165 }}
              >
                <Image
                  src={photo.src}
                  alt="Grad party photo"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
              {!selectionMode && (
                <div
                  className="gp-hover-veil"
                  style={{
                    position: "absolute",
                    inset: 6,
                    background:
                      "linear-gradient(to top, color-mix(in srgb, var(--color-neutral-900) 55%, transparent), transparent 55%)",
                    opacity: 0,
                    transition: "opacity .2s ease",
                    pointerEvents: "none",
                  }}
                />
              )}
              {selectionMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(photo.id);
                  }}
                  aria-label={isSel ? "Deselect photo" : "Select photo"}
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: `1.5px solid ${isSel ? "var(--color-accent)" : "var(--color-bg)"}`,
                    background: isSel
                      ? "var(--color-accent)"
                      : "color-mix(in srgb, var(--color-bg) 80%, transparent)",
                    color: isSel ? "var(--color-bg)" : "var(--color-text)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {isSel ? "✓" : ""}
                </button>
              )}
              {!selectionMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadOne(photo);
                  }}
                  className="gp-select btn-icon btn btn-secondary"
                  title="Download this photo"
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    opacity: 0,
                    transition: "opacity .2s ease",
                    background: "color-mix(in srgb, var(--color-bg) 85%, transparent)",
                  }}
                >
                  &#8595;
                </button>
              )}
            </div>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
