import "server-only";
import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export function originIsLocal(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStartedAt = new Date(Math.floor(now / windowMs) * windowMs);
  const bucketKey = createHash("sha256").update(`${key}:${windowStartedAt.toISOString()}`).digest("hex");
  const result = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("bucketKey", "count", "windowStartedAt")
    VALUES (${bucketKey}, 1, ${windowStartedAt})
    ON CONFLICT ("bucketKey") DO UPDATE SET "count" = "RateLimitBucket"."count" + 1
    RETURNING "count"
  `;
  if (Math.random() < 0.01) {
    await prisma.rateLimitBucket.deleteMany({ where: { windowStartedAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } } });
  }
  return (result[0]?.count ?? limit + 1) <= limit;
}

export function requestFingerprint(request: NextRequest, suffix: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = forwarded || request.headers.get("x-real-ip") || "unknown-client";
  return `${suffix}:${client}`;
}

export function safeExternalUrl(input: string) {
  try {
    const parsed = new URL(input);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
