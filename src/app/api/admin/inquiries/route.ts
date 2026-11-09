import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { jsonError } from "@/lib/security";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getAdminUser())) return jsonError("Sign in to continue.", 401);
  try {
    const [contacts, bookings, registrations] = await Promise.all([
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.consultationBooking.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.eventRegistration.findMany({ include: { event: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    ]);
    return NextResponse.json({ contacts, bookings, registrations }, { headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Enquiries are unavailable until the database is connected.", 503); }
}
