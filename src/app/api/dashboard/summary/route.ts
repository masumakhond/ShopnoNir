import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getFundSummary } from "@/lib/services";

export async function GET() {
  const session = await requireSession(["ADMIN", "MEMBER"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const summary = await getFundSummary();
  return NextResponse.json(summary);
}
