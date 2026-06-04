import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { MemberShell } from "@/components/MemberShell";
import { MemberAccountForm } from "@/components/MemberAccountForm";
import { linkClass } from "@/components/ui";

export default async function MemberAccountPage() {
  const locale = await getLocale();
  const t = getTranslations(locale);
  const session = await requireSession(["MEMBER"]);
  if (!session?.memberId) redirect("/login");

  return (
    <MemberShell
      title={t.account.title}
      subtitle={session.name}
    >
      <Link href="/dashboard/cooperative" className={`inline-flex text-sm ${linkClass}`}>
        ← {t.cooperative}
      </Link>
      <MemberAccountForm />
    </MemberShell>
  );
}
