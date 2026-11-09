import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { getAdminUser } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";
import { mediaUpdateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };
function storageRoot() { return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "storage/uploads"); }

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter valid image details.", 400); }
  const parsed = mediaUpdateSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the image details.", 400);
  try {
    const media = await prisma.media.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ media }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("That image no longer exists.", 404); }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  try {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) return jsonError("That image no longer exists.", 404);
    await prisma.media.delete({ where: { id } });
    const root = storageRoot();
    const optimized = path.resolve(/*turbopackIgnore: true*/ root, media.storageKey);
    const originals = path.resolve(/*turbopackIgnore: true*/ root, media.originalStorageKey);
    if (optimized.startsWith(`${root}${path.sep}`)) await unlink(optimized).catch(() => undefined);
    if (originals.startsWith(`${root}${path.sep}`)) await unlink(originals).catch(() => undefined);
    return new NextResponse(null, { status: 204 });
  } catch { return jsonError("That image could not be deleted.", 500); }
}
