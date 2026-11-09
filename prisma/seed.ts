import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { brand, initialSettings, starterPosts, starterProducts, upcomingEvents } from "../src/lib/content";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before seeding the database.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 16 || password.startsWith("replace-with-")) {
    throw new Error("Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters before seeding.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name: process.env.ADMIN_NAME || "Wamoro Farms Admin", passwordHash, role: "ADMIN", active: true },
    create: { email, name: process.env.ADMIN_NAME || "Wamoro Farms Admin", passwordHash, role: "ADMIN" },
  });

  const avocadoCategory = await prisma.productCategory.upsert({ where: { slug: "avocado-seedlings" }, update: { name: "Avocado seedlings" }, create: { name: "Avocado seedlings", slug: "avocado-seedlings" } });
  const seasonalCategory = await prisma.productCategory.upsert({ where: { slug: "seasonal-produce" }, update: { name: "Seasonal produce" }, create: { name: "Seasonal produce", slug: "seasonal-produce" } });
  for (const product of starterProducts) {
    const categoryId = product.category === "Seasonal produce" ? seasonalCategory.id : avocadoCategory.id;
    const imagePath = product.category === "Seasonal produce" ? product.image : product.image;
    const stockStatus = product.stockStatus;
    const data = {
      name: product.name, slug: product.slug, description: product.description, priceKes: product.priceKes,
      ageLabel: product.ageLabel, stockStatus, featured: product.featured, published: true, categoryId, imagePath,
    };
    await prisma.product.upsert({ where: { slug: product.slug }, update: data, create: data });
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
  for (const post of starterPosts) {
    const categorySlug = post.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await prisma.postCategory.upsert({ where: { slug: categorySlug }, update: { name: post.category }, create: { name: post.category, slug: categorySlug } });
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title, excerpt: post.excerpt, content: post.content, status: "PUBLISHED", featured: post.featured ?? false,
        publishedAt: new Date(`${post.date}T09:00:00Z`), coverImagePath: post.cover, authorId: admin.id,
        categories: { deleteMany: {}, create: { categoryId: category.id } },
      },
      create: {
        title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, status: "PUBLISHED", featured: post.featured ?? false,
        publishedAt: new Date(`${post.date}T09:00:00Z`), coverImagePath: post.cover, authorId: admin.id,
        categories: { create: { categoryId: category.id } },
      },
    });
  }

  for (const event of upcomingEvents) {
    const data = {
      title: event.title, summary: event.summary, description: `${event.summary} Topics include site assessment, grafted seedling selection, planting and early orchard care.`,
      startsAt: event.startsAt, location: event.location, venue: event.venue, feeKes: event.feeKes, capacity: event.capacity,
      status: "UPCOMING" as const, featured: true,
    };
    await prisma.event.upsert({ where: { slug: "avocado-orchard-establishment-masterclass" }, update: data, create: { ...data, slug: "avocado-orchard-establishment-masterclass" } });
  }

  await prisma.siteSetting.upsert({ where: { key: "public" }, update: {}, create: { key: "public", value: JSON.stringify(initialSettings) } });
  const links = [
    { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/myree.carlvinder/", enabled: true, sortOrder: 0 },
    { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/wamoro_farms/", enabled: true, sortOrder: 1 },
    { platform: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@wamoro_farms", enabled: true, sortOrder: 2 },
  ];
  for (const link of links) {
    await prisma.socialMediaLink.upsert({ where: { platform_url: { platform: link.platform, url: link.url } }, update: { label: link.label, enabled: true, sortOrder: link.sortOrder }, create: link });
  }
  console.log(`Seeded Wamoro Farms content and administrator ${email}.`);
  console.log(`Primary WhatsApp: ${brand.whatsapp}; nursery catalogue prices are editable in admin.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
