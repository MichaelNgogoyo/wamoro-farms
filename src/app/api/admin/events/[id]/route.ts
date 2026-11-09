import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";
import { eventInputSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Enter a valid event.", 400); }
  const parsed = eventInputSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Check the required event fields.", 400);
  try {
    const event = await prisma.event.update({ where: { id }, data: { ...parsed.data, startsAt: new Date(parsed.data.startsAt), endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null } });
    return NextResponse.json({ event }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("That event URL is already in use.", 409);
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return jsonError("That event no longer exists.", 404);
    console.error("Event could not be updated", error); return jsonError("The event could not be updated.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { id } = await params;
  try { await prisma.event.delete({ where: { id } }); return new NextResponse(null, { status: 204 }); }
  catch { return jsonError("That event could not be deleted.", 404); }
}
