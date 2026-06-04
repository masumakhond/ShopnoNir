import type { BatchStatus } from "@prisma/client";
import { en } from "./en";
import { bn } from "./bn";

export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Translations = typeof en;

const dictionaries: Record<Locale, Translations> = {
  en,
  bn: bn as unknown as Translations,
};

export function getTranslations(locale: Locale): Translations {
  return dictionaries[locale] ?? dictionaries.en;
}

/** @deprecated Use getTranslations(locale) — kept for gradual migration */
export { bn };

export function batchStatusLabel(locale: Locale, status: BatchStatus | string): string {
  const t = getTranslations(locale);
  const key = status as keyof typeof t.status;
  if (key in t.status && typeof t.status[key] === "string") {
    return t.status[key] as string;
  }
  return String(status);
}

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

export function formatMonthYear(locale: Locale, year: number, month: number): string {
  const months = locale === "bn" ? MONTHS_BN : MONTHS_EN;
  const name = months[month - 1] ?? String(month);
  return `${name} ${year}`;
}

/** @deprecated Use formatMonthYear(locale, ...) */
export function formatMonthYearBn(year: number, month: number): string {
  return formatMonthYear("bn", year, month);
}
