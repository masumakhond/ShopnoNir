import { Badge } from "@/components/ui";
import { BatchTrackingBadge } from "@/components/BatchTrackingBadge";
import { formatBDT } from "@/lib/money";
import { batchStatusLabel, getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { format } from "date-fns";
import type { BatchForProfit } from "@/lib/profit";
import type { getMemberBatchBreakdown } from "@/lib/profit";

type Breakdown = ReturnType<typeof getMemberBatchBreakdown>;

export async function BatchMemberCard({
  batch,
  breakdown,
}: {
  batch: BatchForProfit;
  breakdown: Breakdown;
}) {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const progress = Math.min(100, (breakdown.elapsedDays / breakdown.totalDays) * 100);

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-100">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <BatchTrackingBadge trackingId={batch.trackingId} />
          <p className="font-semibold text-white">{batch.name || t.batches.investmentBatch}</p>
        </div>
        <Badge tone={batch.status === "ACTIVE" ? "success" : "muted"}>
          {batchStatusLabel(locale, batch.status)}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        {format(batch.startDate, "dd MMM yyyy")} – {format(batch.endDate, "dd MMM yyyy")} ·{" "}
        {t.memberDashboard.dayOf} {breakdown.elapsedDays} {t.memberDashboard.of}{" "}
        {breakdown.totalDays}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {breakdown.inMain ? (
          <div className="rounded-xl border border-sky-500/30 bg-zinc-800/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
              {t.memberDashboard.batchMainPool}
            </p>
            <p className="mt-2 text-xl font-bold text-white">{formatBDT(breakdown.mainShare)}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {t.memberDashboard.batchFundMain}: {formatBDT(batch.totalAmount)}
            </p>
          </div>
        ) : null}
        {breakdown.inAdditional && batch.additionalAmount > 0 ? (
          <div className="rounded-xl border border-violet-500/30 bg-zinc-800/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
              {t.memberDashboard.batchAdditionalPool}
            </p>
            <p className="mt-2 text-xl font-bold text-white">{formatBDT(breakdown.additionalShare)}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {t.batches.additionalAmount}: {formatBDT(batch.additionalAmount)}
            </p>
          </div>
        ) : null}
        <div className="rounded-xl border border-amber-500/25 bg-zinc-800/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
            {t.members.profitAmount}
          </p>
          <p className="mt-2 text-xl font-bold text-amber-400">{formatBDT(breakdown.accruedProfit)}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {t.memberDashboard.dailyShare}: {formatBDT(breakdown.perMemberDailyProfit)}/
            {t.dashboard.daysTotal}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-300">
        {t.members.totalCapital}: <strong className="text-white">{formatBDT(breakdown.principalShare)}</strong>
      </p>

      {breakdown.principalReturned ? (
        <p className="mt-2 text-sm font-medium text-sky-400">
          ✓ {t.members.totalCapital} {t.members.returned}
        </p>
      ) : null}

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
