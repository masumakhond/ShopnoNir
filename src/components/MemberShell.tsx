import { ReactNode } from "react";
import { LogoutButton } from "./LogoutButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MemberNav } from "./MemberNav";
import { getLocale } from "@/lib/locale";
import { getTranslations } from "@/lib/i18n";

export async function MemberShell({
  title,
  subtitle,
  wide = false,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  const t = getTranslations(await getLocale());
  const maxW = wide ? "max-w-6xl" : "max-w-3xl";

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="border-b border-zinc-800 bg-black pt-[env(safe-area-inset-top,0px)]">
        <div className={`mx-auto ${maxW} px-4 py-4 sm:py-5`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-amber-400 sm:text-2xl">{t.appName}</h1>
              <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wide text-zinc-400 sm:text-sm">
                {title}
              </p>
              {subtitle ? (
                <p className="mt-1 truncate text-sm text-zinc-500">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher />
              <LogoutButton variant="light" />
            </div>
          </div>
          <MemberNav />
        </div>
      </header>
      <main className={`mx-auto ${maxW} space-y-5 px-3 py-5 sm:space-y-6 sm:px-4 sm:py-6`}>
        {children}
      </main>
    </div>
  );
}
