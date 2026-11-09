import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";
import { productInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  try {
    const [products, categories, media] = await Promise.all([
      prisma.product.findMany({ include: { category: true, media: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
      prisma.productCategory.findMany({ orderBy: { name: "asc" } }),
      prisma.media.findMany({ where: { isPublic: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { id: true, filename: true, caption: true, category: true, altText: true } }),
    ]);
    return NextResponse.json({ products, categories, media }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Products are unavailable until the database is connected.", 503); }
}

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter a valid product.", 400); }
  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the required product fields.", 400);
  try {
    const { category: categoryName, ...productData } = parsed.data;
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await prisma.productCategory.upsert({ where: { slug: categorySlug }, update: { name: categoryName }, create: { name: categoryName, slug: categorySlug } });
    const product = await prisma.product.create({ data: { ...productData, categoryId: category.id, mediaId: productData.mediaId || null, imagePath: productData.mediaId ? null : /capsicum|season/i.test(categoryName) ? "/images/capsicum/green-capsicum-on-plant.jpg" : "/images/avocados/hass-avocado-on-tree.jpg" } });
    return NextResponse.json({ product }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("That product URL is already in use.", 409);
    console.error("Product could not be created", error); return jsonError("The product could not be saved.", 500);
  }
}
