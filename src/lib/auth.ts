import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";
import { prisma } from "@/lib/prisma";

export type AdminSession = {
  userId?: string;
  email?: string;
  role?: "ADMIN" | "EDITOR";
};

function getSessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32 || secret.startsWith("replace-with-"))) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters in production.");
  }
  return {
    cookieName: "wamoro_admin_session",
    password: secret && secret.length >= 32 ? secret : "local-development-session-secret-replace-before-deploy-32",
    ttl: 60 * 60 * 8,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), getSessionOptions());
}

export async function getAdminUser() {
  const session = await getAdminSession();
  if (!session.userId) return null;
  try {
    return await prisma.user.findFirst({
      where: { id: session.userId, active: true, role: { in: ["ADMIN", "EDITOR"] } },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function hasAdminSession() {
  return Boolean(await getAdminUser());
}
