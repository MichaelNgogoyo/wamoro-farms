import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { cleanArticleHtml } from "@/lib/content-sanitizer";
import { jsonError, originIsLocal } from "@/lib/security";
import { postInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  const user = await getAdminUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter a valid post.", 400); }
  const parsed = postInputSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the required post fields.", 400);
  try {
    const categorySlug = parsed.data.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await prisma.postCategory.upsert({ where: { slug: categorySlug }, update: { name: parsed.data.category }, create: { name: parsed.data.category, slug: categorySlug } });
    const post = await prisma.post.update({ where: { id }, data: {
      title: parsed.data.title, slug: parsed.data.slug, excerpt: parsed.data.excerpt, content: cleanArticleHtml(parsed.data.content), status: parsed.data.status,
      featured: parsed.data.featured, scheduledAt: parsed.data.status === "SCHEDULED" && parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      seoTitle: parsed.data.seoTitle || null, seoDescription: parsed.data.seoDescription || null, coverMediaId: parsed.data.coverMediaId || null,
      coverImagePath: parsed.data.coverMediaId ? null : "/images/farm/orchard-rows-aerial.jpg",
      categories: { deleteMany: {}, create: { categoryId: category.id } },
    }, include: { categories: { include: { category: true } }, coverMedia: true } });
    return NextResponse.json({ post }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return jsonError("That post no longer exists.", 404);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("That post URL is already in use.", 409);
    console.error("Post could not be updated", error);
    return jsonError("The post could not be updated.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  try { await prisma.post.delete({ where: { id } }); return new NextResponse(null, { status: 204 }); }
  catch { return jsonError("That post could not be deleted.", 404); }
}
