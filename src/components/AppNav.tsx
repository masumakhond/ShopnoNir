"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/components/LanguageProvider";
import { MobileSideNav } from "@/components/MobileSideNav";

export function AppNav({ nav }: { nav: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const { t } = useTranslations();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const linkClass = (href: string) =>
    `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive(href)
        ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/35"
        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
    }`;

  return (
    <nav className="mt-3 border-t border-zinc-800 bg-black">
      <div className="mx-auto max-w-6xl px-4 pb-2 md:pb-0">
        <MobileSideNav nav={nav} menuLabel={t.nav.menu} linkClass={linkClass} />
      </div>
    </nav>
  );
}
