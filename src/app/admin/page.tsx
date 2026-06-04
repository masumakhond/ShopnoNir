import Link from "next/link";
import { getFundSummary } from "@/lib/services";
import { formatBDT, toNumber } from "@/lib/money";
import { Card, Badge, Button, PageHeader } from "@/components/ui";
import { FundDashboardStats } from "@/components/FundDashboardStats";
import { BatchTrackingBadge } from "@/components/BatchTrackingBadge";
import {
  ResponsiveTable,
  MobileCardList,
  MobileCard,
  DesktopTable,
} from "@/components/ResponsiveTable";
import { format } from "date-fns";
import { batchStatusLabel, getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function AdminDashboardPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const summary = await getFundSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={t.dashboard.overview}
        action={<Button href="/admin/batches/new">{t.actions.newBatch}</Button>}
      />

      <FundDashboardStats summary={summary} t={t} />

      <Card className="p-0 sm:p-0">
        <div className="border-b border-zinc-700/15 px-4 py-4 sm:px-5">
          <h2 className="text-lg font-bold text-white">{t.dashboard.batchesTitle}</h2>
        </div>

        <MobileCardList>
          {summary.batchSummaries.map(({ batch, status, breakdown }) => {
            const fundAccrued =
              breakdown.totalProfit * (breakdown.elapsedDays / breakdown.totalDays);
            return (
              <MobileCard key={batch.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <BatchTrackingBadge trackingId={batch.trackingId} />
                  <Badge
                    tone={
                      status === "ACTIVE"
                        ? "success"
                        : status === "UPCOMING"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {batchStatusLabel(locale, status)}
                  </Badge>
                </div>
                <Link
                  href={`/admin/batches/${batch.id}`}
                  className="mt-2 block font-semibold text-amber-400 hover:underline"
                >
                  {batch.name || t.batches.investmentBatch}
                </Link>
                <p className="mt-1 text-xs text-zinc-400">
                  {format(batch.startDate, "dd MMM yyyy")} –{" "}
                  {format(batch.endDate, "dd MMM yyyy")}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-zinc-400">{t.dashboard.investedCol}</dt>
                    <dd className="text-base font-bold text-amber-200">
                      {formatBDT(toNumber(batch.totalAmount))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">{t.batches.totalProfit}</dt>
                    <dd className="text-base font-bold text-amber-400">
                      {formatBDT(toNumber(batch.totalProfit))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">{t.dashboard.membersCol}</dt>
                    <dd className="font-semibold">{breakdown.memberCount}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-400">{t.dashboard.fundProfitCol}</dt>
                    <dd className="text-base font-bold text-amber-400">{formatBDT(fundAccrued)}</dd>
                  </div>
                </dl>
              </MobileCard>
            );
          })}
        </MobileCardList>

        <DesktopTable>
          <ResponsiveTable className="px-1 pb-1">
            <thead>
              <tr className="border-b border-zinc-700/15 bg-zinc-900/80 text-zinc-400">
                <th className="px-4 py-3">{t.batches.trackingId}</th>
                <th className="px-4 py-3">{t.dashboard.batchCol}</th>
                <th className="px-4 py-3">{t.dashboard.periodCol}</th>
                <th className="px-4 py-3">{t.dashboard.investedCol}</th>
                <th className="px-4 py-3">{t.batches.totalProfit}</th>
                <th className="px-4 py-3">{t.dashboard.membersCol}</th>
                <th className="px-4 py-3">{t.dashboard.statusCol}</th>
                <th className="px-4 py-3">{t.dashboard.fundProfitCol}</th>
              </tr>
            </thead>
            <tbody>
              {summary.batchSummaries.map(({ batch, status, breakdown }) => {
                const fundAccrued =
                  breakdown.totalProfit * (breakdown.elapsedDays / breakdown.totalDays);
                return (
                  <tr key={batch.id} className="border-b border-zinc-700/10 hover:bg-zinc-800/80">
                    <td className="px-4 py-3">
                      <BatchTrackingBadge trackingId={batch.trackingId} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/batches/${batch.id}`}
                        className="font-medium text-amber-400 hover:underline"
                      >
                        {batch.name || t.batches.investmentBatch}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {format(batch.startDate, "dd MMM yyyy")} –{" "}
                      {format(batch.endDate, "dd MMM yyyy")}
                      <span className="block text-xs text-zinc-500">
                        {breakdown.totalDays} {t.dashboard.daysTotal} · {breakdown.elapsedDays}{" "}
                        {t.dashboard.daysElapsed}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-200">
                      {formatBDT(toNumber(batch.totalAmount))}
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-400">
                      {formatBDT(toNumber(batch.totalProfit))}
                    </td>
                    <td className="px-4 py-3">{breakdown.memberCount}</td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          status === "ACTIVE"
                            ? "success"
                            : status === "UPCOMING"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {batchStatusLabel(locale, status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-400">
                      {formatBDT(fundAccrued)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </ResponsiveTable>
        </DesktopTable>
      </Card>
    </div>
  );
}
