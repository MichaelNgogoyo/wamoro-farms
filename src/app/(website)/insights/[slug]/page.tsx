import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ArticleCard } from "@/components/site/article-card";
import { PageHero } from "@/components/site/page-hero";
import { brand } from "@/lib/content";
import { getPublicPosts } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPublicPosts()).find((item) => item.slug === slug);
  return post ? { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, images: [post.cover], type: "article" } } : {};
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const posts = await getPublicPosts();
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== slug).slice(0, 2);
  const articleData = {
    "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt,
    datePublished: `${post.date}T09:00:00+03:00`, author: { "@type": "Organization", name: brand.name },
    publisher: { "@type": "Organization", name: brand.name }, image: post.cover,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }} />
    <PageHero eyebrow={`${post.category} · ${post.readingTime}`} title={post.title} intro={post.excerpt} />
    <div className="article-cover"><Image src={post.cover} alt="" fill priority sizes="100vw" /></div>
    <section className="page-content"><div className="container article-detail-layout">
      <article>
        <div className="article-meta" style={{ marginBottom: 25 }}><time dateTime={post.date}>{new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${post.date}T12:00:00`))}</time><span>Wamoro Farms</span></div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
        <Link href="/insights" className="text-link" style={{ marginTop: 24 }}><ArrowLeft size={15} /> All insights</Link>
      </article>
      <aside className="article-aside"><h2>Planning a farm project?</h2><p>Talk with the Wamoro team about your crop, site and next steps.</p><Link href="/contact" className="button button-dark">Book a consultation <ArrowUpRight size={14} /></Link></aside>
    </div></section>
    {related.length > 0 && <section className="section section-soft"><div className="container"><div className="section-heading"><span className="eyebrow">Keep reading</span><h2>More notes from the field.</h2></div><div className="article-grid">{related.map((item) => <ArticleCard key={item.id} post={item} />)}</div></div></section>}
  </>;
}
