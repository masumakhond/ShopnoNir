import { formatBDT } from "@/lib/money";
import { StatCard } from "@/components/ui";
import { ProfitHighlightCard } from "@/components/ProfitHighlightCard";
import type { getFundSummary } from "@/lib/services";
import type { Translations } from "@/lib/i18n";

type Summary = Pick<
  Awaited<ReturnType<typeof getFundSummary>>,
  "totalInvestedActive" | "totalAdditionalActive" | "totalProfitAccrued" | "totalFundToday"
>;

export function FundDashboardStats({ summary, t }: { summary: Summary; t: Translations }) {
  const showAdditional = summary.totalAdditionalActive > 0;
  const colCount = showAdditional ? 4 : 3;

  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 sm:gap-4 ${
        colCount === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      <ProfitHighlightCard
        label={t.dashboard.profitAccrued}
        value={summary.totalProfitAccrued}
        hint={t.dashboard.profitHint}
        badge={t.dashboard.profitFocusBadge}
      />
      <StatCard
        highlight
        variant="gold"
        label={t.dashboard.currentlyInvested}
        value={formatBDT(summary.totalInvestedActive)}
        hint={t.dashboard.investedHint}
      />
      {showAdditional ? (
        <StatCard
          variant="slate"
          label={t.dashboard.totalAdditionalCapital}
          value={formatBDT(summary.totalAdditionalActive)}
          hint={t.dashboard.additionalCapitalHint}
        />
      ) : null}
      <StatCard
        highlight
        variant="accent"
        label={t.dashboard.totalFundToday}
        value={formatBDT(summary.totalFundToday)}
        hint={t.dashboard.totalFundTodayHint}
      />
    </div>
  );
}
