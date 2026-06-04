import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { suggestNextTrackingId } from "@/lib/batch-id";

export async function GET() {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const trackingId = await suggestNextTrackingId();
  return NextResponse.json({ trackingId });
}
