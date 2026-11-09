import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { getAdminUser } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";
import { mediaUpdateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function storageRoot() {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || "storage/uploads");
}

export async function GET() {
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  try {
    const media = await prisma.media.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }] });
    return NextResponse.json({ media: media.map((item) => ({ ...item, url: `/api/media/${encodeURIComponent(item.filename)}` })) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Media is unavailable until the database is connected.", 503); }
}

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  const user = await getAdminUser();
  if (!user) return jsonError("Sign in to continue.", 401);
  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Choose one or more image files.", 400);
  const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
  const limitMb = Math.min(20, Math.max(1, Number(process.env.MAX_UPLOAD_MB || 10)));
  if (!files.length || files.length > 12) return jsonError("Choose between 1 and 12 images.", 400);
  if (files.some((file) => file.size > limitMb * 1024 * 1024)) return jsonError(`Each image must be no larger than ${limitMb} MB.`, 413);
  if (files.reduce((total, file) => total + file.size, 0) > limitMb * 4 * 1024 * 1024) return jsonError(`The combined upload must be no larger than ${limitMb * 4} MB.`, 413);
  const category = String(form.get("category") || "Fieldwork");
  const meta = mediaUpdateSchema.safeParse({ category, altText: String(form.get("altText") || ""), caption: String(form.get("caption") || "") });
  if (!meta.success) return jsonError("Choose a supported image category and caption.", 400);
  const accepted = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  const prepared: Array<{ file: File; bytes: Buffer; ext: string }> = [];
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const actual = await fileTypeFromBuffer(bytes);
    if (!actual || !accepted.has(actual.mime)) return jsonError("Upload JPEG, PNG, WebP or AVIF images only.", 415);
    if (file.type && file.type !== actual.mime) return jsonError("An image's content does not match its file type.", 415);
    try {
      const image = sharp(bytes, { failOn: "error", limitInputPixels: 40_000_000 });
      const dimensions = await image.metadata();
      if (!dimensions.width || !dimensions.height || dimensions.width > 8_000 || dimensions.height > 8_000) return jsonError("Images must have valid dimensions no larger than 8,000 × 8,000 pixels.", 413);
      prepared.push({ file, bytes, ext: actual.ext });
    } catch { return jsonError("One of the selected files is not a valid image.", 415); }
  }
  const root = storageRoot();
  const originals = path.join(root, "originals");
  await Promise.all([mkdir(root, { recursive: true }), mkdir(originals, { recursive: true })]);
  const saved: Array<{ media: unknown; files: string[] }> = [];
  try {
    for (const item of prepared) {
      const id = randomUUID();
      const filename = `${id}.webp`;
      const storageKey = filename;
      const originalStorageKey = path.posix.join("originals", `${id}.${item.ext}`);
      const originalPath = path.join(/*turbopackIgnore: true*/ root, originalStorageKey);
      const optimizedPath = path.join(/*turbopackIgnore: true*/ root, storageKey);
      const webp = await sharp(item.bytes).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
      const dimensions = await sharp(webp).metadata();
      await Promise.all([writeFile(originalPath, item.bytes, { flag: "wx", mode: 0o600 }), writeFile(optimizedPath, webp, { flag: "wx", mode: 0o640 })]);
      try {
        const media = await prisma.media.create({ data: {
          originalName: item.file.name.slice(0, 255), originalStorageKey, filename, storageKey, mimeType: "image/webp", sizeBytes: webp.byteLength,
          width: dimensions.width ?? null, height: dimensions.height ?? null,
          altText: meta.data.altText, caption: meta.data.caption, category: meta.data.category ?? "Fieldwork", uploadedById: user.id,
        } });
        saved.push({ media, files: [originalPath, optimizedPath] });
      } catch (error) {
        await Promise.allSettled([unlink(originalPath), unlink(optimizedPath)]);
        throw error;
      }
    }
    return NextResponse.json({ media: saved.map((item) => item.media) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Media upload failed", error);
    return jsonError("Some images could not be stored. Check that persistent upload storage is available.", 500);
  }
}
