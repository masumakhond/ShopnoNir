import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { getLocale } from "@/lib/locale";
import { getTranslations } from "@/lib/i18n";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession(["ADMIN"]);
  if (!session) redirect("/login");

  const locale = await getLocale();
  const t = getTranslations(locale);

  const adminNav = [
    { href: "/admin", label: t.nav.dashboard },
    { href: "/admin/members", label: t.nav.members },
    { href: "/admin/batches", label: t.nav.batches },
    { href: "/admin/account", label: t.myAccount },
  ];

  return (
    <AppShell title={t.admin} tagline={t.appName} nav={adminNav} userName={session.name}>
      {children}
    </AppShell>
  );
}
