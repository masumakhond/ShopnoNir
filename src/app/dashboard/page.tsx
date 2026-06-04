import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getMemberWithFinancials } from "@/lib/services";
import { Card, cardHeadingClass, linkClass, mutedTextClass } from "@/components/ui";
import { MemberShell } from "@/components/MemberShell";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { MemberProfileSummary } from "@/components/MemberProfileSummary";
import { BatchMemberCard } from "@/components/BatchMemberCard";
import { MissedBatchesList } from "@/components/MissedBatchesList";
import { BatchTrackingBadge } from "@/components/BatchTrackingBadge";

export default async function MemberDashboardPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const session = await requireSession(["MEMBER"]);
  if (!session?.memberId) redirect("/login");

  const data = await getMemberWithFinancials(session.memberId);
  if (!data) redirect("/login");

  const {
    member,
    totalMainCapital,
    totalAdditionalCapital,
    totalInvestedCapital,
    totalProfit,
    totalPrincipalReturned,
    batchBreakdowns,
    missedBatches,
  } = data;

  return (
    <MemberShell
      title={member.name}
      subtitle={
        <>
          <span className="text-zinc-400">{t.members.memberNumber} </span>
          <span className="text-2xl font-bold text-amber-300 sm:text-3xl">
            #{member.memberNumber}
          </span>
        </>
      }
      wide
    >
      <MemberProfileSummary
        totalMainCapital={totalMainCapital}
        totalAdditionalCapital={totalAdditionalCapital}
        totalInvestedCapital={totalInvestedCapital}
        totalProfit={totalProfit}
        totalPrincipalReturned={totalPrincipalReturned}
      />

      {batchBreakdowns.length > 0 ? (
        <Card>
          <h2 className={cardHeadingClass}>{t.participation.yourIds}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {batchBreakdowns.map(({ batch }) => (
              <BatchTrackingBadge key={batch.id} trackingId={batch.trackingId} />
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className={`${cardHeadingClass} text-amber-400/90`}>{t.participation.missedBatches}</h2>
        <div className="mt-3">
          <MissedBatchesList batches={missedBatches} />
        </div>
      </Card>

      <Card>
        <h2 className={cardHeadingClass}>{t.memberDashboard.myBatches}</h2>
        <div className="mt-4 space-y-4">
          {batchBreakdowns.length === 0 ? (
            <p className={mutedTextClass}>{t.memberDashboard.noBatches}</p>
          ) : (
            batchBreakdowns.map(({ batch, breakdown }) => (
              <BatchMemberCard key={batch.id} batch={batch} breakdown={breakdown} />
            ))
          )}
        </div>
      </Card>

      <Card className="border-zinc-700/80 bg-zinc-900/80">
        <p className="text-sm font-semibold text-zinc-300">{t.fundOverview.title}</p>
        <p className="mt-1 text-sm text-zinc-500">{t.fundOverview.readOnlyHint}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href="/dashboard/cooperative" className={`text-sm font-semibold ${linkClass}`}>
            {t.fundOverview.viewCooperative} →
          </Link>
          <Link href="/dashboard/members" className={`text-sm font-semibold ${linkClass}`}>
            {t.fundOverview.viewAllMembers} →
          </Link>
          <Link href="/dashboard/account" className={`text-sm font-semibold ${linkClass}`}>
            {t.account.manageAccount} →
          </Link>
        </div>
      </Card>

    </MemberShell>
  );
}
