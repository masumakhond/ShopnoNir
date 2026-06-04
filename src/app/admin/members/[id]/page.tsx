import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getMemberWithFinancials } from "@/lib/services";
import { formatBDT } from "@/lib/money";
import { Card, Badge, cardHeadingClass, mutedTextClass, profitTextClass } from "@/components/ui";
import { MemberActions } from "./MemberActions";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { MemberProfileSummary } from "@/components/MemberProfileSummary";
import { BatchMemberCard } from "@/components/BatchMemberCard";
import { MissedBatchesList } from "@/components/MissedBatchesList";
import { BatchTrackingBadge } from "@/components/BatchTrackingBadge";
import { ProfileForm } from "@/components/ProfileForm";

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const session = await requireSession(["ADMIN"]);
  if (!session) notFound();
  const { id } = await params;
  const data = await getMemberWithFinancials(id);
  if (!data) notFound();

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={mutedTextClass}>
            {t.members.memberNumber} #{member.memberNumber}
          </p>
          <h2 className="text-2xl font-bold text-white">{member.name}</h2>
          <p className="text-sm text-zinc-400">{member.user?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={member.active ? "success" : "muted"}>
              {member.active ? t.status.activeMember : t.status.inactiveMember}
            </Badge>
            {member.user?.role === "ADMIN" ? (
              <Badge tone="info">{t.members.hasAdminAccess}</Badge>
            ) : null}
          </div>
        </div>
        <MemberActions
          memberId={member.id}
          active={member.active}
          userRole={member.user?.role}
          userId={member.user?.id}
          currentUserId={session.id}
          hasLogin={Boolean(member.user)}
        />
      </div>

      <MemberProfileSummary
        totalMainCapital={totalMainCapital}
        totalAdditionalCapital={totalAdditionalCapital}
        totalInvestedCapital={totalInvestedCapital}
        totalProfit={totalProfit}
        totalPrincipalReturned={totalPrincipalReturned}
      />

      {batchBreakdowns.length > 0 ? (
        <Card>
          <h3 className={cardHeadingClass}>{t.participation.yourIds}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {batchBreakdowns.map(({ batch }) => (
              <BatchTrackingBadge key={batch.id} trackingId={batch.trackingId} />
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h3 className={`${cardHeadingClass} text-amber-400/90`}>{t.participation.missedBatches}</h3>
        <div className="mt-3">
          <MissedBatchesList batches={missedBatches} />
        </div>
      </Card>

      <Card>
        <h3 className={cardHeadingClass}>{t.members.batchesTitle}</h3>
        <div className="mt-4 space-y-4">
          {batchBreakdowns.length === 0 ? (
            <p className={mutedTextClass}>{t.members.noBatches}</p>
          ) : (
            batchBreakdowns.map(({ batch, breakdown }) => (
              <BatchMemberCard key={batch.id} batch={batch} breakdown={breakdown} />
            ))
          )}
        </div>
      </Card>

      <ProfileForm memberId={member.id} />

    </div>
  );
}
