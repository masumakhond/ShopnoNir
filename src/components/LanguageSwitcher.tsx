"use client";

import { useTranslations } from "@/components/LanguageProvider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t, setLocale } = useTranslations();

  function toggle() {
    const next: Locale = locale === "en" ? "bn" : "en";
    void setLocale(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-xl border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-zinc-200 transition hover:border-amber-500/50 hover:text-amber-300 ${className}`}
      aria-label={locale === "en" ? "Switch to Bengali" : "Switch to English"}
    >
      {t.languageSwitch}
    </button>
  );
}
