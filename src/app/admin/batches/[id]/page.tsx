import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { groupBatchMembersByPool, toBatchForProfit } from "@/lib/services";
import { formatBDT, toNumber } from "@/lib/money";
import { getBatchProfitBreakdown } from "@/lib/profit";
import { Card, Badge, cardHeadingClass, linkClass, mutedTextClass, profitTextClass } from "@/components/ui";
import { format } from "date-fns";
import { batchStatusLabel, getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { BatchActions } from "./BatchActions";
import { BatchTrackingBadge } from "@/components/BatchTrackingBadge";

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const { id } = await params;
  const batch = await prisma.investmentBatch.findUnique({
    where: { id },
    include: { members: { include: { member: true } } },
  });
  if (!batch) notFound();

  const [activeMembers, batchForProfit] = await Promise.all([
    prisma.member.findMany({
      where: { active: true },
      orderBy: { memberNumber: "asc" },
    }),
    Promise.resolve(
      toBatchForProfit({
        ...batch,
        members: batch.members.map((m) => ({
          memberId: m.memberId,
          capitalPool: m.capitalPool,
        })),
      }),
    ),
  ]);

  const status = batchForProfit.status;
  const breakdown = getBatchProfitBreakdown(batchForProfit);
  const pools = groupBatchMembersByPool(
    batch.members.map((m) => ({ memberId: m.memberId, capitalPool: m.capitalPool })),
  );
  const mainTaggedIds = new Set(pools.mainMemberIds);
  const missingMembers = activeMembers.filter((m) => !mainTaggedIds.has(m.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/batches" className={`text-sm ${linkClass}`}>
            {t.batches.backToBatches}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <BatchTrackingBadge trackingId={batch.trackingId} />
            <h2 className="text-2xl font-bold text-white">
              {batch.name || t.batches.investmentBatch}
            </h2>
          </div>
          <Badge tone={status === "ACTIVE" ? "success" : "muted"}>{batchStatusLabel(locale, status)}</Badge>
          {batch.closedAt ? (
            <p className="mt-2 text-sm text-zinc-400">
              {t.batches.closedOn}: {format(batch.closedAt, "dd MMM yyyy")} · {t.batches.closedManually}
            </p>
          ) : status === "COMPLETED" ? (
            <p className="mt-2 text-sm text-zinc-500">{t.batches.closesAutomatically}</p>
          ) : null}
        </div>
        <BatchActions
          batchId={batch.id}
          status={status}
          closedAt={batch.closedAt ? batch.closedAt.toISOString() : null}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className={mutedTextClass}>{t.batches.period}</p>
          <p className="mt-1 font-semibold text-white">
            {format(batch.startDate, "dd MMM yyyy")} – {format(batch.endDate, "dd MMM yyyy")}
          </p>
          <p className="text-xs text-zinc-500">
            {breakdown.totalDays} {t.dashboard.daysTotal}
          </p>
        </Card>
        <Card>
          <p className={mutedTextClass}>{t.batches.totalAmount}</p>
          <p className="mt-1 text-xl font-bold text-white">
            {formatBDT(toNumber(batch.totalAmount))}
          </p>
        </Card>
        <Card>
          <p className={mutedTextClass}>{t.batches.additionalAmount}</p>
          <p className="mt-1 text-xl font-bold text-violet-300">
            {formatBDT(toNumber(batch.additionalAmount))}
          </p>
        </Card>
        <Card>
          <p className={mutedTextClass}>{t.batches.totalProfit}</p>
          <p className={`mt-1 text-xl font-bold ${profitTextClass}`}>
            {formatBDT(breakdown.totalProfit)}
          </p>
          <p className="text-xs text-zinc-500">
            {t.batches.dailyFundProfit}: {formatBDT(breakdown.dailyProfit)}
          </p>
        </Card>
        <Card>
          <p className={mutedTextClass}>{t.batches.perMemberDay}</p>
          <p className={`mt-1 text-xl font-bold ${profitTextClass}`}>
            {formatBDT(breakdown.perMemberDailyProfit)}
          </p>
          <p className="text-xs text-zinc-500">
            {breakdown.elapsedDays} {t.dashboard.daysElapsed}
          </p>
        </Card>
      </div>

      {batch.notes ? (
        <Card>
          <p className={mutedTextClass}>{t.batches.notes}</p>
          <p className="mt-1 text-sm text-zinc-200">{batch.notes}</p>
        </Card>
      ) : null}

      <Card>
        <h3 className={cardHeadingClass}>
          {t.batches.tagMainMembers} ({pools.mainMemberIds.length})
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {batch.members
            .filter((bm) => bm.capitalPool === "MAIN")
            .map(({ member }) => (
            <li key={`main-${member.id}`}>
              <Link
                href={`/admin/members/${member.id}`}
                className="block rounded-lg border border-sky-500/30 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 hover:border-amber-500/40 hover:bg-zinc-800"
              >
                #{member.memberNumber} {member.name}
                <span className={`mt-0.5 block ${profitTextClass}`}>
                  {t.members.accrued}:{" "}
                  {formatBDT(breakdown.perMemberDailyProfit * breakdown.elapsedDays)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {toNumber(batch.additionalAmount) > 0 ? (
        <Card>
          <h3 className={cardHeadingClass}>
            {t.batches.tagAdditionalMembers} ({pools.additionalMemberIds.length})
          </h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {batch.members
              .filter((bm) => bm.capitalPool === "ADDITIONAL")
              .map(({ member }) => (
                <li key={`add-${member.id}`}>
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="block rounded-lg border border-violet-500/30 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200"
                  >
                    #{member.memberNumber} {member.name}
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <h3 className={`${cardHeadingClass} text-amber-400/90`}>
          {t.batches.missingMembers} ({missingMembers.length})
        </h3>
        {missingMembers.length === 0 ? (
          <p className={`mt-2 text-sm ${profitTextClass}`}>{t.batches.allMembersTagged}</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {missingMembers.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/admin/members/${member.id}`}
                  className="block rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-zinc-200 hover:border-amber-500/50 hover:bg-amber-500/10"
                >
                  #{member.memberNumber} {member.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
