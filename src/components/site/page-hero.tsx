export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <section className="page-hero">
      <div className="container page-hero-inner">
        <span className="eyebrow eyebrow-light">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <span className="page-hero-mark" aria-hidden="true">WF</span>
    </section>
  );
}
