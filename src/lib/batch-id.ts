import { prisma } from "./prisma";

/** Normalize user input e.g. "2263", "id 2263" → "ID 2263" */
export function normalizeTrackingId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly && trimmed.replace(/\s/g, "").match(/^id?\d+$/i)) {
    return `ID ${digitsOnly}`;
  }

  if (/^id\s+\d+/i.test(trimmed)) {
    const num = trimmed.replace(/^id\s+/i, "").replace(/\D/g, "");
    return `ID ${num}`;
  }

  return trimmed;
}

/** Suggest next ID like ID 2264 based on highest number in existing batches */
export async function suggestNextTrackingId(): Promise<string> {
  const batches = await prisma.investmentBatch.findMany({
    select: { trackingId: true },
  });

  let maxNum = 0;
  for (const { trackingId } of batches) {
    if (!trackingId) continue;
    const match = trackingId.match(/(\d+)/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  }

  return `ID ${maxNum + 1}`;
}

export async function resolveTrackingId(input?: string | null): Promise<string> {
  const normalized = input ? normalizeTrackingId(input) : "";
  if (normalized) {
    const taken = await prisma.investmentBatch.findUnique({
      where: { trackingId: normalized },
    });
    if (taken) throw new Error("TRACKING_ID_TAKEN");
    return normalized;
  }
  return suggestNextTrackingId();
}
