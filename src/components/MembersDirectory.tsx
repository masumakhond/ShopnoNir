import { formatBDT } from "@/lib/money";
import type { MemberDirectoryRow } from "@/lib/services";
import { Card, Badge, StatCard } from "@/components/ui";
import { ProfitHighlightCard } from "@/components/ProfitHighlightCard";
import {
  ResponsiveTable,
  MobileCardList,
  MobileCard,
} from "@/components/ResponsiveTable";
import { getTranslations, type Locale } from "@/lib/i18n";

export function MembersDirectory({
  members,
  totals,
  locale,
  highlightMemberId,
}: {
  members: MemberDirectoryRow[];
  totals: {
    totalMainCapital: number;
    totalAdditionalCapital: number;
    totalInvestedCapital: number;
    totalProfit: number;
  };
  locale: Locale;
  highlightMemberId?: string;
}) {
  const t = getTranslations(locale);

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400">
        {t.fundOverview.readOnlyHint}
      </p>

      <div
        className={`grid gap-3 sm:grid-cols-2 sm:gap-4 ${
          totals.totalAdditionalCapital > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        <ProfitHighlightCard
          label={t.fundOverview.totalMemberProfit}
          value={totals.totalProfit}
          badge={t.dashboard.profitFocusBadge}
        />
        <StatCard
          highlight
          variant="gold"
          label={t.fundOverview.totalBatchCapital}
          value={formatBDT(totals.totalMainCapital)}
        />
        {totals.totalAdditionalCapital > 0 ? (
          <StatCard
            variant="slate"
            label={t.dashboard.totalAdditionalCapital}
            value={formatBDT(totals.totalAdditionalCapital)}
          />
        ) : null}
      </div>

      <MobileCardList>
        {members.map((m) => {
          const isYou = m.id === highlightMemberId;
          return (
            <MobileCard
              key={m.id}
              className={isYou ? "ring-1 ring-amber-500/40" : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-zinc-400">#{m.memberNumber}</p>
                  <p className="font-semibold text-white">
                    {m.name}
                    {isYou ? (
                      <span className="ml-2 text-xs font-normal text-amber-400">
                        ({t.fundOverview.you})
                      </span>
                    ) : null}
                  </p>
                </div>
                <Badge tone={m.active ? "success" : "muted"}>
                  {m.active ? t.status.activeMember : t.status.inactiveMember}
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-zinc-400">{t.members.mainAmount}</dt>
                  <dd className="font-semibold">{formatBDT(m.totalMainCapital)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-400">{t.members.additionalAmount}</dt>
                  <dd className="font-semibold text-violet-300">
                    {formatBDT(m.totalAdditionalCapital)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-400">{t.members.profit}</dt>
                  <dd className="font-semibold text-amber-400">{formatBDT(m.totalProfit)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-400">{t.members.totalCapital}</dt>
                  <dd className="font-semibold">{formatBDT(m.totalInvestedCapital)}</dd>
                </div>
              </dl>
            </MobileCard>
          );
        })}
      </MobileCardList>

      <Card className="hidden overflow-hidden p-0 md:block">
        <ResponsiveTable>
          <thead className="bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="px-4 py-3">{t.members.number}</th>
              <th className="px-4 py-3">{t.members.name}</th>
              <th className="px-4 py-3">{t.members.mainAmount}</th>
              <th className="px-4 py-3">{t.members.additionalAmount}</th>
              <th className="px-4 py-3">{t.members.totalCapital}</th>
              <th className="px-4 py-3">{t.members.profit}</th>
              <th className="px-4 py-3">{t.members.status}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const isYou = m.id === highlightMemberId;
              return (
                <tr
                  key={m.id}
                  className={`border-t border-zinc-700 transition hover:bg-zinc-800/80 ${
                    isYou ? "bg-amber-500/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-zinc-400">{m.memberNumber}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    {m.name}
                    {isYou ? (
                      <span className="ml-2 text-xs font-normal text-amber-400">
                        ({t.fundOverview.you})
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{formatBDT(m.totalMainCapital)}</td>
                  <td className="px-4 py-3 text-violet-300">
                    {formatBDT(m.totalAdditionalCapital)}
                  </td>
                  <td className="px-4 py-3">{formatBDT(m.totalInvestedCapital)}</td>
                  <td className="px-4 py-3 text-amber-400">{formatBDT(m.totalProfit)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={m.active ? "success" : "muted"}>
                      {m.active ? t.status.activeMember : t.status.inactiveMember}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </ResponsiveTable>
      </Card>
    </div>
  );
}
