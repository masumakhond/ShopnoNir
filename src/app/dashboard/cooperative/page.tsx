import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getFundSummary } from "@/lib/services";
import { getLocale } from "@/lib/locale";
import { getTranslations } from "@/lib/i18n";
import { MemberShell } from "@/components/MemberShell";
import { FundOverview } from "@/components/FundOverview";

export default async function MemberCooperativePage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const session = await requireSession(["MEMBER"]);
  if (!session?.memberId) redirect("/login");

  const summary = await getFundSummary();

  return (
    <MemberShell
      title={t.fundOverview.title}
      subtitle={t.fundOverview.subtitle}
      wide
    >
      <FundOverview summary={summary} locale={locale} readOnly />
    </MemberShell>
  );
}
