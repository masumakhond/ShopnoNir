import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge, Button, PageHeader } from "@/components/ui";
import {
  ResponsiveTable,
  MobileCardList,
  MobileCard,
} from "@/components/ResponsiveTable";
import { formatBDT } from "@/lib/money";
import { getMemberWithFinancials } from "@/lib/services";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function AdminMembersPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const members = await prisma.member.findMany({
    orderBy: { memberNumber: "asc" },
    include: { user: { select: { email: true, role: true } } },
  });

  const rows = await Promise.all(
    members.map(async (m) => {
      const fin = await getMemberWithFinancials(m.id);
      return { member: m, fin };
    }),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle={`${members.length} ${t.members.countHint}`}
        action={<Button href="/admin/members/new">{t.actions.addMember}</Button>}
      />

      <MobileCardList>
        {rows.map(({ member, fin }) => (
          <MobileCard key={member.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-zinc-400">#{member.memberNumber}</p>
                <p className="truncate font-semibold text-white">{member.name}</p>
                <p className="truncate text-xs text-zinc-400">{member.user?.email}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Badge tone={member.active ? "success" : "muted"}>
                  {member.active ? t.status.activeMember : t.status.inactiveMember}
                </Badge>
                {member.user?.role === "ADMIN" ? (
                  <Badge tone="info">{t.members.hasAdminAccess}</Badge>
                ) : null}
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-zinc-400">{t.members.principal}</dt>
                <dd className="font-semibold">{formatBDT(fin?.totalInvestedCapital ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-zinc-400">{t.members.profit}</dt>
                <dd className="font-semibold text-amber-400">
                  {formatBDT(fin?.totalProfit ?? 0)}
                </dd>
              </div>
            </dl>
            <Link
              href={`/admin/members/${member.id}`}
              className="mt-3 inline-flex text-sm font-semibold text-amber-400 hover:underline"
            >
              {t.actions.view} →
            </Link>
          </MobileCard>
        ))}
      </MobileCardList>

      <Card className="hidden overflow-hidden p-0 md:block">
        <ResponsiveTable>
          <thead className="bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="px-4 py-3">{t.members.number}</th>
              <th className="px-4 py-3">{t.members.name}</th>
              <th className="px-4 py-3">{t.members.email}</th>
              <th className="px-4 py-3">{t.members.principal}</th>
              <th className="px-4 py-3">{t.members.profit}</th>
              <th className="px-4 py-3">{t.members.status}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ member, fin }) => (
              <tr
                key={member.id}
                className="border-t border-zinc-700 transition hover:bg-zinc-800/80"
              >
                <td className="px-4 py-3 font-mono text-zinc-400">{member.memberNumber}</td>
                <td className="px-4 py-3 font-medium">{member.name}</td>
                <td className="max-w-[10rem] truncate px-4 py-3 text-zinc-400 lg:max-w-none">
                  {member.user?.email}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatBDT(fin?.totalInvestedCapital ?? 0)}
                </td>
                <td className="px-4 py-3 font-medium text-amber-400">
                  {formatBDT(fin?.totalProfit ?? 0)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={member.active ? "success" : "muted"}>
                      {member.active ? t.status.activeMember : t.status.inactiveMember}
                    </Badge>
                    {member.user?.role === "ADMIN" ? (
                      <Badge tone="info">{t.members.hasAdminAccess}</Badge>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="text-sm font-semibold text-amber-400 hover:underline"
                  >
                    {t.actions.view}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </ResponsiveTable>
      </Card>
    </div>
  );
}
