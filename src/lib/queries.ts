import "server-only";
import { brand, starterPosts, starterProducts, upcomingEvents, galleryItems, initialSettings, type ArticleCardData, type ProductCardData } from "@/lib/content";
import { prisma } from "@/lib/prisma";

function guessProductImage(category: string, slug: string) {
  if (/capsicum|season/i.test(`${category} ${slug}`)) return "/images/capsicum/green-capsicum-on-plant.jpg";
  return "/images/avocados/hass-avocado-on-tree.jpg";
}

export async function getPublicProducts(): Promise<ProductCardData[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      include: { category: true, media: true },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
    if (!rows.length) return starterProducts;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      priceKes: row.priceKes,
      ageLabel: row.ageLabel,
      stockStatus: row.stockStatus,
      category: row.category?.name ?? "Nursery",
      image: row.media ? `/api/media/${encodeURIComponent(row.media.filename)}` : row.imagePath || guessProductImage(row.category?.name ?? "", row.slug),
      imageAlt: row.media?.altText || row.name,
      featured: row.featured,
    }));
  } catch {
    return starterProducts;
  }
}

export async function getPublicPosts(): Promise<ArticleCardData[]> {
  try {
    const now = new Date();
    const rows = await prisma.post.findMany({
      where: { OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", scheduledAt: { lte: now } }] },
      include: { coverMedia: true, categories: { include: { category: true } } },
      orderBy: [{ featured: "desc" }, { scheduledAt: "desc" }, { publishedAt: "desc" }],
    });
    if (!rows.length) return starterPosts;
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      date: (row.publishedAt ?? row.scheduledAt ?? row.createdAt).toISOString().slice(0, 10),
      category: row.categories[0]?.category.name ?? "Farm notes",
      cover: row.coverMedia ? `/api/media/${encodeURIComponent(row.coverMedia.filename)}` : row.coverImagePath || "/images/farm/orchard-rows-aerial.jpg",
      readingTime: `${Math.max(2, Math.ceil(row.content.replace(/<[^>]+>/g, " ").split(/\s+/).length / 190))} min read`,
      featured: row.featured,
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      content: row.content,
    }));
  } catch {
    return starterPosts;
  }
}

export async function getPublicGallery() {
  try {
    const media = await prisma.media.findMany({ where: { isPublic: true }, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }] });
    if (media.length) return media.map((item) => ({ id: item.id, title: item.caption || item.filename, category: item.category, image: `/api/media/${encodeURIComponent(item.filename)}`, alt: item.altText || item.filename, featured: item.featured }));
  } catch { /* keep the local demonstration gallery visible until the database is configured */ }
  return galleryItems;
}

export async function getPublicEvents() {
  try {
    const rows = await prisma.event.findMany({ where: { status: "UPCOMING", startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } });
    if (rows.length) return rows;
  } catch { /* keep the local demonstration event visible */ }
  return upcomingEvents;
}

export async function getPublicSettings() {
  try {
    const record = await prisma.siteSetting.findUnique({ where: { key: "public" } });
    if (record) return { ...initialSettings, ...JSON.parse(record.value) } as typeof initialSettings;
  } catch { /* public pages can render before the database is available */ }
  return initialSettings;
}

export const getSiteSettings = getPublicSettings;

export async function getPublicVideos() {
  try {
    return await prisma.videoEmbed.findMany({ where: { enabled: true }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }] });
  } catch { return []; }
}

export async function getPublicSocialLinks() {
  try {
    const rows = await prisma.socialMediaLink.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } });
    if (rows.length) return rows.map((item) => ({ label: item.label, href: item.url, platform: item.platform }));
  } catch { /* preserve profile links while the database is not available */ }
  return brand.socials.map((item) => ({ ...item, platform: item.label.toLowerCase() }));
}
