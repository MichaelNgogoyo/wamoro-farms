"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

export type GalleryCardData = { id: string; title: string; category: string; image: string; alt: string; featured?: boolean };
const categories = ["Farm Visits", "Nursery", "Avocados", "Training", "Processing", "Community", "Fieldwork"];

export function GalleryGrid({ items }: { items: GalleryCardData[] }) {
  const [filter, setFilter] = useState("All photos");
  const [active, setActive] = useState<GalleryCardData | null>(null);
  const availableCategories = ["All photos", ...Array.from(new Set([...categories, ...items.map((item) => item.category)]))];
  const shown = useMemo(() => filter === "All photos" ? items : items.filter((item) => item.category === filter), [items, filter]);
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setActive(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
  return (
    <>
      <div className="filters" aria-label="Filter gallery photos">
        {availableCategories.map((item) => <button key={item} type="button" className="filter-button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      {shown.length ? <div className="gallery-grid">
        {shown.map((item) => <button className="gallery-tile" key={item.id} onClick={() => setActive(item)} aria-label={`View ${item.title}`}>
          <Image src={item.image} alt={item.alt} fill sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 30vw" />
          <span className="gallery-tile-copy"><small>{item.category}</small><strong>{item.title}</strong></span>
        </button>)}
      </div> : <div className="empty-state">There are no photos in this category yet.</div>}
      {active && <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title} onClick={() => setActive(null)}>
        <div className="lightbox-inner" onClick={(event) => event.stopPropagation()}>
          <button className="lightbox-close" onClick={() => setActive(null)} aria-label="Close image viewer"><X size={20} /></button>
          <div className="lightbox-image"><Image src={active.image} alt={active.alt} fill sizes="90vw" priority /></div>
          <div className="lightbox-caption"><small>{active.category}</small>{active.title}</div>
        </div>
      </div>}
    </>
  );
}
