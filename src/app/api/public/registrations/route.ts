import { NextRequest, NextResponse } from "next/server";
import { jsonError, originIsLocal, rateLimit, requestFingerprint } from "@/lib/security";
import { registrationSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Please complete the form and try again.", 400); }
  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Please check the form fields and try again.", 400);
  const { website, ...data } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 202 });
  try {
    if (!(await rateLimit(requestFingerprint(request, "registration"), 4, 60 * 60))) return jsonError("Too many registrations were sent. Please try again later.", 429);
    const event = await prisma.event.findFirst({ where: { id: parsed.data.eventId, status: "UPCOMING", startsAt: { gt: new Date() } } });
    if (!event) return jsonError("This event is no longer open for registration.", 404);
    if (event.capacity) {
      const confirmed = await prisma.eventRegistration.count({ where: { eventId: event.id, status: "CONFIRMED" } });
      if (confirmed >= event.capacity) return jsonError("This session is full. Please contact the training team about another date.", 409);
    }
    await prisma.eventRegistration.create({ data });
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return jsonError("You are already registered for this event with that email address.", 409);
    console.error("Event registration could not be stored", error);
    return jsonError("Registration is temporarily unavailable. Please contact the training team.", 503);
  }
}
