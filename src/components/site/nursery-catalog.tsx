"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import type { ProductCardData } from "@/lib/content";

export function NurseryCatalog({ products }: { products: ProductCardData[] }) {
  const [category, setCategory] = useState("All plants & produce");
  const [search, setSearch] = useState("");
  const categories = ["All plants & produce", ...Array.from(new Set(products.map((item) => item.category)))];
  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === "All plants & produce" || product.category === category;
    const term = search.trim().toLowerCase();
    return matchesCategory && (!term || `${product.name} ${product.description} ${product.ageLabel} ${product.category}`.toLowerCase().includes(term));
  }), [products, category, search]);
  return (
    <>
      <div className="product-toolbar">
        <div className="filters" aria-label="Filter nursery catalogue">
          {categories.map((item) => <button key={item} type="button" className="filter-button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <label className="search-wrap"><span className="sr-only">Search nursery products</span><input className="search-input" type="search" placeholder="Search seedlings…" value={search} onChange={(event) => setSearch(event.target.value)} /><Search size={15} aria-hidden="true" /></label>
      </div>
      {filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state">No products match that search. Try another crop or variety.</div>}
      <p className="form-note">Prices are current draft listings and can be updated by the nursery team. Please confirm stock and collection arrangements before travelling.</p>
    </>
  );
}
