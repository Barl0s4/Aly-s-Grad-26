export default function Nav() {
  return (
    <nav
      className="nav"
      style={{
        background: "color-mix(in srgb, var(--color-bg) 88%, transparent)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      <span className="nav-brand">Alyssa&rsquo;s Grad Party</span>
      <a href="#details">Details</a>
      <a href="#gallery">Gallery</a>
      <a href="#upload">Add Photos</a>
    </nav>
  );
}
