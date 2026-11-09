import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";
import { eventInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  try { return NextResponse.json({ events: await prisma.event.findMany({ include: { _count: { select: { registrations: true } } }, orderBy: { startsAt: "asc" } }) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return jsonError("Events are unavailable until the database is connected.", 503); }
}

async function saveEvent(payload: unknown, request: NextRequest, eventId?: string) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const parsed = eventInputSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the required event fields.", 400);
  const data = { ...parsed.data, startsAt: new Date(parsed.data.startsAt), endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null };
  try {
    const event = eventId
      ? await prisma.event.update({ where: { id: eventId }, data })
      : await prisma.event.create({ data });
    return NextResponse.json({ event }, { status: eventId ? 200 : 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("That event URL is already in use.", 409);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return jsonError("That event no longer exists.", 404);
    console.error("Event could not be saved", error); return jsonError("The event could not be saved.", 500);
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter a valid event.", 400); }
  return saveEvent(payload, request);
}
