import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MONTHLY_CONTRIBUTION_BDT } from "@/lib/constants";

const bulkSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().positive().optional(),
});

export async function POST(request: Request) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = bulkSchema.parse(await request.json());
    const amount = body.amount ?? MONTHLY_CONTRIBUTION_BDT;

    const activeMembers = await prisma.member.findMany({
      where: { active: true },
      select: { id: true },
      orderBy: { memberNumber: "asc" },
    });

    const existing = await prisma.monthlyContribution.findMany({
      where: {
        year: body.year,
        month: body.month,
        memberId: { in: activeMembers.map((m) => m.id) },
      },
      select: { memberId: true },
    });

    const existingIds = new Set(existing.map((e) => e.memberId));
    const toCreate = activeMembers.filter((m) => !existingIds.has(m.id));

    if (toCreate.length > 0) {
      await prisma.monthlyContribution.createMany({
        data: toCreate.map((m) => ({
          memberId: m.id,
          year: body.year,
          month: body.month,
          amount,
        })),
      });
    }

    return NextResponse.json({
      created: toCreate.length,
      skipped: existingIds.size,
      totalActive: activeMembers.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Bulk record failed" }, { status: 500 });
  }
}
