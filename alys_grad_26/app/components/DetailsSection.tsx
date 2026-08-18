export default function DetailsSection() {
  return (
    <section id="details" style={{ padding: "var(--space-6)", maxWidth: 1180, margin: "0 auto" }}>
      <hr className="hr" style={{ marginTop: 0 }} />
      <div className="details-grid">
        <div className="card">
          <p className="card-kicker">Date</p>
          <p className="card-title">Saturday, August 15</p>
          <p className="card-body">2026</p>
        </div>
        <div className="card">
          <p className="card-kicker">Occasion</p>
          <p className="card-title">UCLA Grad</p>
          <p className="card-body">Class of 2026</p>
        </div>
      </div>
    </section>
  );
}
