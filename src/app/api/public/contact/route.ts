import { NextRequest, NextResponse } from "next/server";
import { jsonError, originIsLocal, rateLimit, requestFingerprint } from "@/lib/security";
import { contactSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Please complete the form and try again.", 400); }
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) return jsonError("Please check the form fields and try again.", 400);
  const { website, ...values } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 202 });
  try {
    if (!(await rateLimit(requestFingerprint(request, "contact"), 5, 60 * 60))) return jsonError("Too many messages were sent. Please try again later.", 429);
    await prisma.contactMessage.create({ data: values });
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Contact enquiry could not be stored", error);
    return jsonError("The enquiry form is temporarily unavailable. Please contact us on WhatsApp.", 503);
  }
}
