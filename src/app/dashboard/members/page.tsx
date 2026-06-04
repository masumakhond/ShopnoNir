import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getMembersDirectory } from "@/lib/services";
import { getLocale } from "@/lib/locale";
import { getTranslations } from "@/lib/i18n";
import { MemberShell } from "@/components/MemberShell";
import { MembersDirectory } from "@/components/MembersDirectory";

export default async function MemberDirectoryPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const session = await requireSession(["MEMBER"]);
  if (!session?.memberId) redirect("/login");

  const { members, totals } = await getMembersDirectory();

  return (
    <MemberShell
      title={t.fundOverview.membersTitle}
      subtitle={t.fundOverview.membersSubtitle}
      wide
    >
      <MembersDirectory
        members={members}
        totals={totals}
        locale={locale}
        highlightMemberId={session.memberId}
      />
    </MemberShell>
  );
}
