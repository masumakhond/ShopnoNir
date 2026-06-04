import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { defaultLocale, locales } from "@/lib/i18n";

export const LOCALE_COOKIE = "samiti_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}
