import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { cleanArticleHtml } from "@/lib/content-sanitizer";
import { jsonError, originIsLocal } from "@/lib/security";
import { postInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  try {
    const posts = await prisma.post.findMany({ include: { categories: { include: { category: true } }, coverMedia: true }, orderBy: { updatedAt: "desc" } });
    return NextResponse.json({ posts }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Posts are unavailable until the database is connected.", 503); }
}

async function savePost(data: ReturnType<typeof postInputSchema.parse>, authorId: string, postId?: string) {
  const categorySlug = data.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const category = await prisma.postCategory.upsert({ where: { slug: categorySlug }, update: { name: data.category }, create: { name: data.category, slug: categorySlug } });
  const status = data.status;
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
  const publishedAt = status === "PUBLISHED" ? new Date() : null;
  const input = {
    title: data.title, slug: data.slug, excerpt: data.excerpt, content: cleanArticleHtml(data.content), status,
    featured: data.featured, scheduledAt: status === "SCHEDULED" ? scheduledAt : null, publishedAt,
    seoTitle: data.seoTitle || null, seoDescription: data.seoDescription || null,
    coverMediaId: data.coverMediaId || null,
    coverImagePath: data.coverMediaId ? null : "/images/farm/orchard-rows-aerial.jpg",
  };
  return postId
    ? prisma.post.update({ where: { id: postId }, data: { ...input, categories: { deleteMany: {}, create: { categoryId: category.id } } }, include: { categories: { include: { category: true } }, coverMedia: true } })
    : prisma.post.create({ data: { ...input, authorId, categories: { create: { categoryId: category.id } } }, include: { categories: { include: { category: true } }, coverMedia: true } });
}

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  const user = await getAdminUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter a valid post.", 400); }
  const parsed = postInputSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the required post fields.", 400);
  if (parsed.data.scheduledAt && Number.isNaN(new Date(parsed.data.scheduledAt).getTime())) return jsonError("Choose a valid publish date.", 400);
  try {
    if (parsed.data.coverMediaId && !(await prisma.media.findUnique({ where: { id: parsed.data.coverMediaId } }))) return jsonError("Choose an available cover image.", 400);
    const post = await savePost(parsed.data, user.id);
    return NextResponse.json({ post }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("That post URL is already in use.", 409);
    console.error("Post could not be saved", error);
    return jsonError("The post could not be saved.", 500);
  }
}
