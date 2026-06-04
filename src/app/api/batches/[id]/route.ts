import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildBatchMemberRows, deriveBatchStatus, groupBatchMembersByPool, toBatchForProfit } from "@/lib/services";
import { getBatchProfitBreakdown } from "@/lib/profit";
import { normalizeTrackingId } from "@/lib/batch-id";
import { toNumber } from "@/lib/money";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const batch = await prisma.investmentBatch.findUnique({
    where: { id },
    include: {
      members: { include: { member: true } },
    },
  });

  if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tagged = batch.members.map((m) => ({
    memberId: m.memberId,
    capitalPool: m.capitalPool,
  }));
  const batchForProfit = toBatchForProfit({ ...batch, members: tagged });
  const pools = groupBatchMembersByPool(tagged);

  return NextResponse.json({
    batch,
    status: batchForProfit.status,
    breakdown: getBatchProfitBreakdown(batchForProfit),
    pools,
  });
}

const updateSchema = z.object({
  trackingId: z.string().optional(),
  name: z.string().nullable().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  additionalAmount: z.number().nonnegative().optional(),
  totalProfit: z.number().nonnegative().optional(),
  mainMemberIds: z.array(z.string()).min(1).optional(),
  additionalMemberIds: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
  close: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const body = updateSchema.parse(await request.json());
    const existing = await prisma.investmentBatch.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const startDate = body.startDate ? new Date(body.startDate) : existing.startDate;
    const endDate = body.endDate ? new Date(body.endDate) : existing.endDate;

    let trackingId = existing.trackingId;
    if (body.trackingId) {
      const normalized = normalizeTrackingId(body.trackingId);
      if (!normalized) {
        return NextResponse.json({ error: "Invalid investment ID" }, { status: 400 });
      }
      const taken = await prisma.investmentBatch.findFirst({
        where: { trackingId: normalized, id: { not: id } },
      });
      if (taken) {
        return NextResponse.json({ error: "This investment ID is already used" }, { status: 409 });
      }
      trackingId = normalized;
    }

    const additionalAmount =
      body.additionalAmount !== undefined
        ? body.additionalAmount
        : toNumber(existing.additionalAmount);
    const additionalMemberIds = body.additionalMemberIds ?? [];

    if (body.mainMemberIds && additionalAmount > 0 && additionalMemberIds.length === 0) {
      return NextResponse.json(
        { error: "Tag at least one member for additional capital" },
        { status: 400 },
      );
    }

    const closedAt = body.close === true ? (existing.closedAt ?? new Date()) : existing.closedAt;
    const status = deriveBatchStatus(startDate, endDate, existing.status, new Date(), closedAt);

    await prisma.$transaction(async (tx) => {
      await tx.investmentBatch.update({
        where: { id },
        data: {
          trackingId,
          name: body.name,
          startDate,
          endDate,
          totalAmount: body.totalAmount,
          additionalAmount: body.additionalAmount,
          totalProfit: body.totalProfit,
          status,
          closedAt,
          notes: body.notes,
        },
      });

      if (body.mainMemberIds) {
        const memberRows = buildBatchMemberRows(body.mainMemberIds, additionalMemberIds);
        await tx.batchMember.deleteMany({ where: { batchId: id } });
        await tx.batchMember.createMany({ data: memberRows.map((r) => ({ batchId: id, ...r })) });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Batch update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireSession(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.investmentBatch.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.investmentBatch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
