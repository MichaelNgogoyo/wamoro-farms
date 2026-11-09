import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type Params = { params: Promise<{ filename: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { filename } = await params;
  if (!/^[0-9a-f-]{36}\.webp$/.test(filename)) return new NextResponse("Not found", { status: 404 });
  try {
    const media = await prisma.media.findUnique({ where: { filename } });
    if (!media || (!media.isPublic && !(await getAdminUser()))) return new NextResponse("Not found", { status: 404 });
    const root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "storage/uploads");
    const file = path.resolve(/*turbopackIgnore: true*/ root, media.storageKey);
    if (!file.startsWith(`${root}${path.sep}`)) return new NextResponse("Not found", { status: 404 });
    const data = await readFile(file);
    return new NextResponse(data, { headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(data.byteLength),
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": media.isPublic ? "public, max-age=86400, stale-while-revalidate=604800" : "private, no-store",
    } });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
