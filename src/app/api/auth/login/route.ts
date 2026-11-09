import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth";
import { jsonError, originIsLocal, rateLimit, requestFingerprint } from "@/lib/security";
import { loginSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter a valid email and password.", 400); }
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Enter a valid email and password.", 400);
  try {
    const allowed = await rateLimit(requestFingerprint(request, "login"), 8, 15 * 60);
    if (!allowed) return jsonError("Too many sign-in attempts. Wait a few minutes and try again.", 429);
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const matches = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;
    if (!user || !user.active || !matches || !["ADMIN", "EDITOR"].includes(user.role)) return jsonError("Email or password was not recognized.", 401);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const session = await getAdminSession();
    session.destroy();
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    await session.save();
    return NextResponse.json({ ok: true, redirectTo: "/admin" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin login unavailable", error);
    return jsonError("Sign-in is unavailable until the database is connected.", 503);
  }
}
