import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { PageHeader } from "@/components/ui";
import { ProfileForm } from "@/components/ProfileForm";

export default async function AdminAccountPage() {
  const t = getTranslations(await getLocale());

  return (
    <div className="space-y-6">
      <PageHeader title={t.account.title} subtitle={t.account.subtitle} />
      <ProfileForm />
    </div>
  );
}
