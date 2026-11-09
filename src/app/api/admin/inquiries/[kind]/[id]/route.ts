import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";
import { prisma } from "@/lib/prisma";

const inquiryStatus = z.enum(["NEW", "IN_REVIEW", "REPLIED", "CLOSED"]);
const registrationStatus = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);
type Params = { params: Promise<{ kind: string; id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  const { kind, id } = await params;
  let payload: unknown;
  try { payload = await request.json(); } catch { return jsonError("Choose a valid status.", 400); }
  const parsed = (kind === "registration" ? registrationStatus : inquiryStatus).safeParse(
    payload && typeof payload === "object" && "status" in payload ? payload.status : undefined,
  );
  if (!parsed.success) return jsonError("Choose a valid status for this message.", 400);
  try {
    const result = kind === "contact"
      ? await prisma.contactMessage.update({ where: { id }, data: { status: parsed.data as "NEW" | "IN_REVIEW" | "REPLIED" | "CLOSED" } })
      : kind === "booking"
        ? await prisma.consultationBooking.update({ where: { id }, data: { status: parsed.data as "NEW" | "IN_REVIEW" | "REPLIED" | "CLOSED" } })
        : kind === "registration"
          ? await prisma.eventRegistration.update({ where: { id }, data: { status: parsed.data as "PENDING" | "CONFIRMED" | "CANCELLED" } })
          : null;
    if (!result) return jsonError("That message type is not supported.", 404);
    return NextResponse.json({ ok: true, status: result.status }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") return jsonError("That message no longer exists.", 404);
    console.error("Enquiry status could not be updated", error);
    return jsonError("The status could not be updated.", 500);
  }
}
