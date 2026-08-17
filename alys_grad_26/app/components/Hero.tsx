import Image from "next/image";
import type { Photo } from "../types";

type HeroProps = {
  heroPhoto: Photo;
  onDownloadAll: () => void;
  zipping: boolean;
  downloadAllLabel: string;
};

export default function Hero({
  heroPhoto,
  onDownloadAll,
  zipping,
  downloadAllLabel,
}: HeroProps) {
  return (
    <section
      style={{
        padding: "var(--space-8) var(--space-6) var(--space-6)",
        maxWidth: 1180,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: "var(--space-8)",
        alignItems: "center",
      }}
      className="hero-grid"
    >
      <div style={{ animation: "fadeUp 0.6s ease" }}>
        <p className="tag tag-outline" style={{ marginBottom: "var(--space-3)" }}>
          Class of 2026
        </p>
        <h1 style={{ fontSize: 56, fontWeight: 400, marginBottom: "var(--space-2)" }}>
          Allysa&rsquo;s Grad Party
        </h1>
        <p style={{ fontSize: 18, opacity: 0.75, marginBottom: "var(--space-4)", maxWidth: 520 }}>
          UCLA, Class of 2026 &mdash; thank you for celebrating with us.
          Every photo from the day lives here now &mdash; take whatever
          you want.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <a href="#gallery" className="btn btn-primary">
            Browse the gallery
          </a>
          <button
            className="btn btn-secondary"
            onClick={onDownloadAll}
            disabled={zipping}
          >
            {downloadAllLabel}
          </button>
        </div>
      </div>
      <figure className="plate elev-lg" style={{ margin: 0, position: "relative", height: 440 }}>
        <Image
          src={heroPhoto.src}
          alt="Allysa in front of the UCLA Grad marquee"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 520px"
          style={{ objectFit: "cover" }}
        />
      </figure>
    </section>
  );
}
