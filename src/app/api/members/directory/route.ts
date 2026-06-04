import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getMembersDirectory } from "@/lib/services";

export async function GET() {
  const session = await requireSession(["ADMIN", "MEMBER"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const directory = await getMembersDirectory();
  return NextResponse.json(directory);
}
