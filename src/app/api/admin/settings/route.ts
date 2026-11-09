import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { initialSettings } from "@/lib/content";
import { jsonError, originIsLocal, safeExternalUrl } from "@/lib/security";
import { settingsSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

const socialSchema = z.object({ platform: z.enum(["facebook", "instagram", "tiktok", "youtube"]), label: z.string().trim().min(2).max(50), url: z.url().max(400), enabled: z.boolean().default(true) });
const videoSchema = z.object({ platform: z.enum(["youtube", "tiktok", "facebook", "instagram"]), url: z.url().max(500), title: z.string().trim().min(2).max(120), caption: z.string().trim().max(300).default(""), featured: z.boolean().default(false), enabled: z.boolean().default(true) });
const payloadSchema = z.object({ settings: settingsSchema, socials: z.array(socialSchema).max(8), videos: z.array(videoSchema).max(20) });

const platformHosts: Record<string, string[]> = {
  facebook: ["facebook.com", "www.facebook.com"],
  instagram: ["instagram.com", "www.instagram.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
  youtube: ["youtube.com", "www.youtube.com", "youtu.be"],
};

function validPlatformUrl(platform: string, value: string) {
  const safe = safeExternalUrl(value);
  if (!safe) return false;
  try { return platformHosts[platform]?.includes(new URL(safe).hostname) ?? false; } catch { return false; }
}

export async function GET() {
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  try {
    const [record, socials, videos, media] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "public" } }),
      prisma.socialMediaLink.findMany({ orderBy: [{ sortOrder: "asc" }, { platform: "asc" }] }),
      prisma.videoEmbed.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
      prisma.media.findMany({ where: { isPublic: true }, orderBy: { createdAt: "desc" }, select: { id: true, filename: true, caption: true, category: true } }),
    ]);
    const settings = record ? { ...initialSettings, ...JSON.parse(record.value) } : initialSettings;
    return NextResponse.json({ settings, socials, videos, media }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Settings are unavailable until the database is connected.", 503); }
}

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter valid site settings.", 400); }
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the site settings and social links.", 400);
  const { settings, socials, videos } = parsed.data;
  if (settings.youtubeChannelUrl && !validPlatformUrl("youtube", settings.youtubeChannelUrl)) return jsonError("Use a valid HTTPS YouTube channel URL.", 400);
  if (settings.founderPortrait && !/^\/api\/media\/[0-9a-f-]{36}\.webp$/.test(settings.founderPortrait)) return jsonError("Choose an uploaded founder image.", 400);
  if (socials.some((item) => !validPlatformUrl(item.platform, item.url))) return jsonError("Each social link must use its matching HTTPS platform URL.", 400);
  if (videos.some((item) => !validPlatformUrl(item.platform, item.url))) return jsonError("Each video link must use a matching HTTPS platform URL.", 400);
  if (settings.mpesaEnabled !== false) return jsonError("M-Pesa remains disabled pending verification.", 400);
  try {
    const duplicate = new Set<string>();
    for (const link of socials) {
      const key = `${link.platform}:${link.url}`;
      if (duplicate.has(key)) return jsonError("Remove duplicate social media links.", 400);
      duplicate.add(key);
    }
    const duplicateVideo = new Set<string>();
    for (const item of videos) {
      const key = `${item.platform}:${item.url}`;
      if (duplicateVideo.has(key)) return jsonError("Remove duplicate video links.", 400);
      duplicateVideo.add(key);
    }
    await prisma.$transaction(async (tx) => {
      await tx.siteSetting.upsert({ where: { key: "public" }, update: { value: JSON.stringify(settings) }, create: { key: "public", value: JSON.stringify(settings) } });
      await tx.socialMediaLink.deleteMany();
      await tx.videoEmbed.deleteMany();
      if (socials.length) await tx.socialMediaLink.createMany({ data: socials.map((item, index) => ({ ...item, sortOrder: index })) });
      if (videos.length) await tx.videoEmbed.createMany({ data: videos });
    });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Site settings could not be saved", error);
    return jsonError("Site settings could not be saved.", 500);
  }
}
