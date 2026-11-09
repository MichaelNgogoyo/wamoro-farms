"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/site/article-card";
import type { ArticleCardData } from "@/lib/content";

export function InsightsList({ posts }: { posts: ArticleCardData[] }) {
  const [category, setCategory] = useState("All topics");
  const [search, setSearch] = useState("");
  const categories = ["All topics", ...Array.from(new Set(posts.map((post) => post.category)))];
  const visible = useMemo(() => posts.filter((post) => {
    const term = search.toLowerCase().trim();
    return (category === "All topics" || post.category === category) && (!term || `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(term));
  }), [posts, category, search]);
  return <>
    <div className="article-search-row">
      <div className="filters" aria-label="Filter insight categories">{categories.map((item) => <button key={item} className="filter-button" type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <label className="search-wrap"><span className="sr-only">Search insights</span><input type="search" className="search-input" placeholder="Search farming guides…" value={search} onChange={(event) => setSearch(event.target.value)} /><Search size={15} aria-hidden="true" /></label>
    </div>
    {visible.length ? <div className="article-grid">{visible.map((post) => <ArticleCard key={post.id} post={post} />)}</div> : <div className="empty-state">No guides match those filters. Try another search.</div>}
  </>;
}
