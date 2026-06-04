import { CapitalPool } from "@prisma/client";

export type TaggedMember = { memberId: string; capitalPool: CapitalPool };

export function groupBatchMembersByPool(members: TaggedMember[]) {
  const mainMemberIds = members
    .filter((m) => m.capitalPool === CapitalPool.MAIN)
    .map((m) => m.memberId);
  const additionalMemberIds = members
    .filter((m) => m.capitalPool === CapitalPool.ADDITIONAL)
    .map((m) => m.memberId);
  const uniqueMemberIds = [...new Set(members.map((m) => m.memberId))];
  return { mainMemberIds, additionalMemberIds, uniqueMemberIds };
}

export function buildBatchMemberRows(
  mainMemberIds: string[],
  additionalMemberIds: string[],
): TaggedMember[] {
  const rows: TaggedMember[] = [];
  for (const memberId of mainMemberIds) {
    rows.push({ memberId, capitalPool: CapitalPool.MAIN });
  }
  for (const memberId of additionalMemberIds) {
    rows.push({ memberId, capitalPool: CapitalPool.ADDITIONAL });
  }
  return rows;
}

export function getMemberCapitalInBatch(
  amounts: { totalAmount: number; additionalAmount: number },
  pools: ReturnType<typeof groupBatchMembersByPool>,
  memberId: string,
) {
  const mainShare = pools.mainMemberIds.includes(memberId)
    ? amounts.totalAmount / Math.max(1, pools.mainMemberIds.length)
    : 0;
  const additionalShare = pools.additionalMemberIds.includes(memberId)
    ? amounts.additionalAmount / Math.max(1, pools.additionalMemberIds.length)
    : 0;
  return {
    mainShare,
    additionalShare,
    totalShare: mainShare + additionalShare,
  };
}
