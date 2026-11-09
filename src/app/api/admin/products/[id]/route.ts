import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";
import { productInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter a valid product.", 400); }
  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the required product fields.", 400);
  try {
    const { category: categoryName, ...productData } = parsed.data;
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const category = await prisma.productCategory.upsert({ where: { slug: categorySlug }, update: { name: categoryName }, create: { name: categoryName, slug: categorySlug } });
    const product = await prisma.product.update({ where: { id }, data: { ...productData, categoryId: category.id, mediaId: productData.mediaId || null } });
    return NextResponse.json({ product }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("That product URL is already in use.", 409);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return jsonError("That product no longer exists.", 404);
    console.error("Product could not be updated", error); return jsonError("The product could not be updated.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  try { await prisma.product.delete({ where: { id } }); return new NextResponse(null, { status: 204 }); }
  catch { return jsonError("That product could not be deleted.", 404); }
}
