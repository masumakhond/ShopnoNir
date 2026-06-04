import { StatCard } from "@/components/ui";
import { ProfitHighlightCard } from "@/components/ProfitHighlightCard";
import { formatBDT } from "@/lib/money";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function MemberProfileSummary({
  totalMainCapital,
  totalAdditionalCapital,
  totalInvestedCapital,
  totalProfit,
  totalPrincipalReturned,
}: {
  totalMainCapital: number;
  totalAdditionalCapital: number;
  totalInvestedCapital: number;
  totalProfit: number;
  totalPrincipalReturned: number;
}) {
  const t = getTranslations(await getLocale());
  const showAdditional = totalAdditionalCapital > 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t.memberDashboard.summarySectionBatches}
        </p>
        <div
          className={`grid gap-3 sm:grid-cols-2 sm:gap-4 ${
            showAdditional ? "lg:grid-cols-3" : ""
          }`}
        >
          <ProfitHighlightCard
            label={t.memberDashboard.profitAccrued}
            value={totalProfit}
            hint={t.memberDashboard.profitHint}
            badge={t.memberDashboard.profitFocusBadge}
          />
          <StatCard
            highlight
            variant="gold"
            label={t.members.mainAmount}
            value={formatBDT(totalMainCapital)}
            hint={t.memberDashboard.yourMainCapital}
          />
          {showAdditional ? (
            <StatCard
              variant="slate"
              label={t.members.additionalAmount}
              value={formatBDT(totalAdditionalCapital)}
              hint={t.memberDashboard.yourAdditionalCapital}
            />
          ) : (
            <StatCard
              variant="dark"
              label={t.members.totalCapital}
              value={formatBDT(totalInvestedCapital)}
            />
          )}
        </div>
        {showAdditional ? (
          <div className="mt-3">
            <StatCard
              variant="dark"
              label={t.members.totalCapital}
              value={formatBDT(totalInvestedCapital)}
            />
          </div>
        ) : null}
      </div>

      {totalPrincipalReturned > 0 ? (
        <StatCard
          variant="accent"
          label={t.memberDashboard.principalReturned}
          value={formatBDT(totalPrincipalReturned)}
        />
      ) : null}
    </div>
  );
}
