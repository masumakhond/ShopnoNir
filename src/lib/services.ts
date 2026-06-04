import { BatchStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { toNumber } from "./money";
import { buildBatchMemberRows, groupBatchMembersByPool, type TaggedMember } from "./batch-capital";
import { getBatchProfitBreakdown, getMemberBatchBreakdown, type BatchForProfit } from "./profit";
import { isAfter, isBefore, startOfDay } from "date-fns";

export function toBatchForProfit(
  batch: {
    id: string;
    trackingId: string;
    name: string | null;
    startDate: Date;
    endDate: Date;
    totalAmount: { toString(): string } | number;
    additionalAmount?: { toString(): string } | number | null;
    totalProfit: { toString(): string } | number;
    status: BatchStatus;
    closedAt?: Date | null;
    members: TaggedMember[];
  },
  asOf = new Date(),
): BatchForProfit {
  const closedAt = batch.closedAt ?? null;
  const pools = groupBatchMembersByPool(batch.members);
  return {
    id: batch.id,
    trackingId: batch.trackingId,
    name: batch.name,
    startDate: batch.startDate,
    endDate: batch.endDate,
    totalAmount: toNumber(batch.totalAmount),
    additionalAmount: toNumber(batch.additionalAmount ?? 0),
    totalProfit: toNumber(batch.totalProfit),
    closedAt,
    status: deriveBatchStatus(batch.startDate, batch.endDate, batch.status, asOf, closedAt),
    memberCount: Math.max(1, pools.uniqueMemberIds.length),
  };
}

export function deriveBatchStatus(
  startDate: Date,
  endDate: Date,
  stored: BatchStatus,
  asOf = new Date(),
  closedAt?: Date | null,
): BatchStatus {
  if (closedAt) return BatchStatus.COMPLETED;

  const today = startOfDay(asOf);
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  if (isBefore(today, start)) return BatchStatus.UPCOMING;
  if (isAfter(today, end)) return BatchStatus.COMPLETED;
  return BatchStatus.ACTIVE;
}

export async function getMemberWithFinancials(memberId: string, asOf = new Date()) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      batchMembers: {
        include: {
          batch: {
            include: {
              members: { select: { memberId: true, capitalPool: true } },
            },
          },
        },
        orderBy: { batch: { startDate: "desc" } },
      },
      user: { select: { id: true, email: true, role: true } },
    },
  });

  if (!member) return null;

  const participatedIds = new Set(member.batchMembers.map((bm) => bm.batchId));

  const allBatches = await prisma.investmentBatch.findMany({
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      trackingId: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });

  const missedBatches = allBatches.filter((b) => !participatedIds.has(b.id));

  const batchesById = new Map<string, (typeof member.batchMembers)[0]["batch"]>();
  for (const bm of member.batchMembers) {
    batchesById.set(bm.batchId, bm.batch);
  }

  const batchBreakdowns = [...batchesById.values()].map((batch) => {
    const tagged = batch.members as TaggedMember[];
    const pools = groupBatchMembersByPool(tagged);
    const batchForProfit = toBatchForProfit({ ...batch, members: tagged }, asOf);
    const breakdown = getMemberBatchBreakdown(batchForProfit, pools, memberId, asOf);
    return { batch: batchForProfit, breakdown, pools };
  });

  const totalMainCapital = batchBreakdowns.reduce((s, b) => s + b.breakdown.mainShare, 0);
  const totalAdditionalCapital = batchBreakdowns.reduce(
    (s, b) => s + b.breakdown.additionalShare,
    0,
  );
  const totalInvestedCapital = totalMainCapital + totalAdditionalCapital;

  const totalProfit = batchBreakdowns.reduce((sum, b) => sum + b.breakdown.accruedProfit, 0);

  const totalPrincipalReturned = batchBreakdowns.reduce(
    (sum, b) => sum + (b.breakdown.principalReturned ? b.breakdown.principalShare : 0),
    0,
  );

  return {
    member,
    totalMainCapital,
    totalAdditionalCapital,
    totalInvestedCapital,
    totalPrincipal: totalInvestedCapital,
    totalProfit,
    totalPrincipalReturned,
    batchBreakdowns,
    missedBatches,
  };
}

export async function getFundSummary(asOf = new Date()) {
  const [members, batches] = await Promise.all([
    prisma.member.count({ where: { active: true } }),
    prisma.investmentBatch.findMany({
      include: { members: { select: { memberId: true, capitalPool: true } } },
      orderBy: { startDate: "desc" },
    }),
  ]);

  let totalInvestedActive = 0;
  let totalAdditionalActive = 0;
  let totalProfitAccrued = 0;

  const batchSummaries = batches.map((batch) => {
    const tagged = batch.members as TaggedMember[];
    const batchForProfit = toBatchForProfit({ ...batch, members: tagged }, asOf);
    const pools = groupBatchMembersByPool(tagged);
    const status = batchForProfit.status;
    const breakdown = getBatchProfitBreakdown(batchForProfit, asOf);
    totalProfitAccrued +=
      breakdown.totalProfit * (breakdown.elapsedDays / breakdown.totalDays);

    if (status === BatchStatus.ACTIVE) {
      totalInvestedActive += batchForProfit.totalAmount;
      totalAdditionalActive += batchForProfit.additionalAmount;
    }

    return { batch: batchForProfit, status, breakdown, pools };
  });

  const totalFundToday =
    totalInvestedActive + totalAdditionalActive + totalProfitAccrued;

  return {
    activeMembers: members,
    totalInvestedActive,
    totalAdditionalActive,
    totalProfitAccrued,
    totalFundToday,
    batchSummaries,
  };
}

export type MemberDirectoryRow = {
  id: string;
  memberNumber: number;
  name: string;
  active: boolean;
  totalMainCapital: number;
  totalAdditionalCapital: number;
  totalInvestedCapital: number;
  totalProfit: number;
};

export async function getMembersDirectory(asOf = new Date()) {
  const members = await prisma.member.findMany({
    orderBy: { memberNumber: "asc" },
    select: { id: true, memberNumber: true, name: true, active: true },
  });

  const rows: MemberDirectoryRow[] = await Promise.all(
    members.map(async (m) => {
      const fin = await getMemberWithFinancials(m.id, asOf);
      return {
        id: m.id,
        memberNumber: m.memberNumber,
        name: m.name,
        active: m.active,
        totalMainCapital: fin?.totalMainCapital ?? 0,
        totalAdditionalCapital: fin?.totalAdditionalCapital ?? 0,
        totalInvestedCapital: fin?.totalInvestedCapital ?? 0,
        totalProfit: fin?.totalProfit ?? 0,
      };
    }),
  );

  const totals = rows.reduce(
    (acc, r) => ({
      totalMainCapital: acc.totalMainCapital + r.totalMainCapital,
      totalAdditionalCapital: acc.totalAdditionalCapital + r.totalAdditionalCapital,
      totalInvestedCapital: acc.totalInvestedCapital + r.totalInvestedCapital,
      totalProfit: acc.totalProfit + r.totalProfit,
    }),
    { totalMainCapital: 0, totalAdditionalCapital: 0, totalInvestedCapital: 0, totalProfit: 0 },
  );

  return { members: rows, totals, count: rows.length };
}

export { buildBatchMemberRows, groupBatchMembersByPool };
