import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MONTHLY_CONTRIBUTION_BDT } from "@/lib/constants";

export async function GET(request: Request) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  const contributions = await prisma.monthlyContribution.findMany({
    where: memberId ? { memberId } : undefined,
    include: {
      member: { select: { id: true, name: true, memberNumber: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json({ contributions });
}

const createSchema = z.object({
  memberId: z.string(),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().positive().optional(),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = createSchema.parse(await request.json());
    const contribution = await prisma.monthlyContribution.create({
      data: {
        memberId: body.memberId,
        year: body.year,
        month: body.month,
        amount: body.amount ?? MONTHLY_CONTRIBUTION_BDT,
        note: body.note,
      },
    });
    return NextResponse.json({ contribution }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Contribution already exists or invalid" }, { status: 500 });
  }
}
