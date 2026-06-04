import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toBatchForProfit } from "@/lib/services";
import { formatBDT, toNumber } from "@/lib/money";
import { getBatchProfitBreakdown } from "@/lib/profit";
import { BatchTrackingBadge } from "@/components/BatchTrackingBadge";
import { Card, Badge, Button, PageHeader, StatBox } from "@/components/ui";
import { format } from "date-fns";
import { batchStatusLabel, getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function AdminBatchesPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const batches = await prisma.investmentBatch.findMany({
    include: { members: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={t.batches.listHint}
        action={<Button href="/admin/batches/new">{t.actions.newBatch}</Button>}
      />

      <div className="grid gap-4">
        {batches.map((batch) => {
          const tagged = batch.members.map((m) => ({
            memberId: m.memberId,
            capitalPool: m.capitalPool,
          }));
          const batchForProfit = toBatchForProfit({ ...batch, members: tagged });
          const status = batchForProfit.status;
          const breakdown = getBatchProfitBreakdown(batchForProfit);
          return (
            <Card key={batch.id} className="border-l-4 border-l-amber-500">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <BatchTrackingBadge trackingId={batch.trackingId} />
                    <Link
                      href={`/admin/batches/${batch.id}`}
                      className="text-base font-bold text-amber-400 hover:underline sm:text-lg"
                    >
                      {batch.name || t.batches.investmentBatch}
                    </Link>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {format(batch.startDate, "dd MMM yyyy")} –{" "}
                    {format(batch.endDate, "dd MMM yyyy")} ({breakdown.totalDays}{" "}
                    {t.dashboard.daysTotal})
                  </p>
                </div>
                <Badge
                  tone={
                    status === "ACTIVE" ? "success" : status === "UPCOMING" ? "warning" : "muted"
                  }
                >
                  {batchStatusLabel(locale, status)}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox
                  label={t.batches.invested}
                  value={formatBDT(toNumber(batch.totalAmount))}
                />
                <StatBox
                  label={t.batches.totalProfit}
                  value={formatBDT(toNumber(batch.totalProfit))}
                  variant="profit"
                />
                <StatBox label={t.dashboard.membersCol} value={batch.members.length} variant="info" />
                <StatBox
                  label={t.batches.perMemberDay}
                  value={formatBDT(breakdown.perMemberDailyProfit)}
                  variant="profit"
                  className="col-span-2 sm:col-span-1"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
