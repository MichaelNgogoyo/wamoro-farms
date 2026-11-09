import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { jsonError, originIsLocal } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!originIsLocal(request)) return jsonError("Request could not be verified.", 403);
  const session = await getAdminSession();
  session.destroy();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
