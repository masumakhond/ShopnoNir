import {
  differenceInCalendarDays,
  isAfter,
  isBefore,
  min,
  startOfDay,
} from "date-fns";
import type { groupBatchMembersByPool } from "./batch-capital";

export type BatchForProfit = {
  id: string;
  trackingId: string;
  name: string | null;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  additionalAmount: number;
  totalProfit: number;
  status: string;
  memberCount: number;
  closedAt?: Date | null;
};

/** Inclusive calendar days in batch period */
export function getTotalDaysInBatch(startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  return Math.max(1, differenceInCalendarDays(end, start) + 1);
}

/** Days elapsed for profit accrual (inclusive), capped at batch end and asOf date */
export function getElapsedDays(
  startDate: Date,
  endDate: Date,
  asOf: Date = new Date(),
): number {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const today = startOfDay(asOf);

  if (isBefore(today, start)) return 0;

  const effectiveEnd = min([end, today]);
  return Math.max(0, differenceInCalendarDays(effectiveEnd, start) + 1);
}

/**
 * Profit accrues daily: totalProfit ÷ totalDays, split equally among all tagged members (any pool).
 */
export function getBatchProfitBreakdown(batch: BatchForProfit, asOf: Date = new Date()) {
  const totalDays = getTotalDaysInBatch(batch.startDate, batch.endDate);
  const profitAsOf = batch.closedAt
    ? min([startOfDay(asOf), startOfDay(batch.closedAt)])
    : startOfDay(asOf);
  const elapsedDays = getElapsedDays(batch.startDate, batch.endDate, profitAsOf);
  const memberCount = Math.max(1, batch.memberCount);

  const totalProfit = batch.totalProfit;
  const dailyProfit = totalProfit / totalDays;
  const perMemberDailyProfit = dailyProfit / memberCount;
  const accruedProfit = perMemberDailyProfit * elapsedDays;

  const isComplete =
    Boolean(batch.closedAt) || isAfter(startOfDay(asOf), startOfDay(batch.endDate));

  return {
    totalDays,
    elapsedDays,
    memberCount,
    totalProfit,
    dailyProfit,
    perMemberDailyProfit,
    accruedProfit,
    principalReturned: isComplete,
    remainingDays: Math.max(0, totalDays - elapsedDays),
  };
}

export function getMemberProfitFromBatch(batch: BatchForProfit, asOf?: Date): number {
  return getBatchProfitBreakdown(batch, asOf).accruedProfit;
}

export function getMemberBatchBreakdown(
  batch: BatchForProfit,
  pools: ReturnType<typeof groupBatchMembersByPool>,
  memberId: string,
  asOf: Date = new Date(),
) {
  const profitBreakdown = getBatchProfitBreakdown(batch, asOf);
  const mainShare = pools.mainMemberIds.includes(memberId)
    ? batch.totalAmount / Math.max(1, pools.mainMemberIds.length)
    : 0;
  const additionalShare = pools.additionalMemberIds.includes(memberId)
    ? batch.additionalAmount / Math.max(1, pools.additionalMemberIds.length)
    : 0;
  const principalShare = mainShare + additionalShare;
  const inMain = pools.mainMemberIds.includes(memberId);
  const inAdditional = pools.additionalMemberIds.includes(memberId);

  return {
    ...profitBreakdown,
    mainShare,
    additionalShare,
    principalShare,
    inMain,
    inAdditional,
    perMemberDailyProfit: profitBreakdown.perMemberDailyProfit,
    accruedProfit: pools.uniqueMemberIds.includes(memberId)
      ? profitBreakdown.accruedProfit
      : 0,
    principalReturned: profitBreakdown.principalReturned && principalShare > 0,
  };
}
