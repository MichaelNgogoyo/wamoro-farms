import { NextRequest, NextResponse } from "next/server";
import { jsonError, originIsLocal, rateLimit, requestFingerprint } from "@/lib/security";
import { bookingSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Please complete the form and try again.", 400); }
  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Please check the form fields and try again.", 400);
  const { website, preferredDate: preferredDateInput, ...values } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 202 });
  const preferredDate = preferredDateInput ? new Date(`${preferredDateInput}T12:00:00.000Z`) : null;
  if (preferredDate && Number.isNaN(preferredDate.getTime())) return jsonError("Choose a valid consultation date.", 400);
  try {
    if (!(await rateLimit(requestFingerprint(request, "booking"), 4, 60 * 60))) return jsonError("Too many requests were sent. Please try again later.", 429);
    await prisma.consultationBooking.create({ data: { ...values, preferredDate } });
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Consultation enquiry could not be stored", error);
    return jsonError("The consultation form is temporarily unavailable. Please contact us on WhatsApp.", 503);
  }
}
