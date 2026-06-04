import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildBatchMemberRows, deriveBatchStatus, toBatchForProfit } from "@/lib/services";
import { getBatchProfitBreakdown } from "@/lib/profit";
import { resolveTrackingId } from "@/lib/batch-id";

export async function GET() {
  const session = await requireSession(["ADMIN", "MEMBER"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const batches = await prisma.investmentBatch.findMany({
    include: {
      members: {
        include: { member: { select: { id: true, name: true, memberNumber: true } } },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const enriched = batches.map((batch) => {
    const tagged = batch.members.map((m) => ({
      memberId: m.memberId,
      capitalPool: m.capitalPool,
    }));
    const batchForProfit = toBatchForProfit({ ...batch, members: tagged });
    return {
      ...batch,
      status: batchForProfit.status,
      breakdown: getBatchProfitBreakdown(batchForProfit),
    };
  });

  return NextResponse.json({ batches: enriched });
}

const createSchema = z.object({
  trackingId: z.string().optional(),
  name: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  totalAmount: z.number().positive(),
  additionalAmount: z.number().nonnegative().optional(),
  totalProfit: z.number().nonnegative(),
  mainMemberIds: z.array(z.string()).min(1),
  additionalMemberIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = createSchema.parse(await request.json());
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (endDate <= startDate) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }

    const additionalAmount = body.additionalAmount ?? 0;
    const additionalMemberIds = body.additionalMemberIds ?? [];

    if (additionalAmount > 0 && additionalMemberIds.length === 0) {
      return NextResponse.json(
        { error: "Tag at least one member for additional capital" },
        { status: 400 },
      );
    }

    const memberRows = buildBatchMemberRows(body.mainMemberIds, additionalMemberIds);
    const trackingId = await resolveTrackingId(body.trackingId);
    const status = deriveBatchStatus(startDate, endDate, "ACTIVE");

    const batch = await prisma.investmentBatch.create({
      data: {
        trackingId,
        name: body.name,
        startDate,
        endDate,
        totalAmount: body.totalAmount,
        additionalAmount,
        totalProfit: body.totalProfit,
        status,
        notes: body.notes,
        members: { create: memberRows },
      },
      include: {
        members: { include: { member: true } },
      },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error && error.message === "TRACKING_ID_TAKEN") {
      return NextResponse.json({ error: "This investment ID is already used" }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create batch" }, { status: 500 });
  }
}
