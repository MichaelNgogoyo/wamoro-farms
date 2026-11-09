import type { MetadataRoute } from "next";
import { getPublicPosts } from "@/lib/queries";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

const staticPaths = ["", "/about", "/services", "/nursery", "/gallery", "/insights", "/training", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublicPosts();
  const paths = [
    ...staticPaths.map((path) => ({ url: `${siteUrl}${path}`, lastModified: new Date() })),
    ...posts.map((post) => ({ url: `${siteUrl}/insights/${post.slug}`, lastModified: new Date(`${post.date}T12:00:00`) })),
  ];
  return paths;
}
