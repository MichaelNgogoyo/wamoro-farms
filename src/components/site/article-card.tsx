import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ArticleCardData } from "@/lib/content";

export function ArticleCard({ post }: { post: ArticleCardData }) {
  return (
    <article className="article-card">
      <Link className="article-image" href={`/insights/${post.slug}`} aria-label={`Read ${post.title}`}>
        <Image src={post.cover} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" />
        <span className="article-category">{post.category}</span>
      </Link>
      <div className="article-body">
        <div className="article-meta"><time dateTime={post.date}>{new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${post.date}T12:00:00`))}</time><span>{post.readingTime}</span></div>
        <h3><Link href={`/insights/${post.slug}`}>{post.title}</Link></h3>
        <p>{post.excerpt}</p>
        <Link className="text-link" href={`/insights/${post.slug}`}>Read article <ArrowUpRight size={15} /></Link>
      </div>
    </article>
  );
}
