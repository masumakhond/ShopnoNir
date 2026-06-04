"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "@/components/LanguageProvider";
import { MobileSideNav } from "@/components/MobileSideNav";

export function MemberNav() {
  const pathname = usePathname();
  const { t } = useTranslations();

  const nav = [
    { href: "/dashboard/cooperative", label: t.cooperative },
    { href: "/dashboard", label: t.myDashboard },
    { href: "/dashboard/members", label: t.allMembers },
    { href: "/dashboard/account", label: t.myAccount },
  ];

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const linkClass = (href: string) =>
    `block rounded-xl px-4 py-3 text-sm font-semibold transition ${
      isActive(href)
        ? "bg-amber-400/15 text-amber-300 ring-1 ring-amber-500/35"
        : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
    }`;

  return (
    <div className="mt-3 border-t border-zinc-800/80 pt-1 md:pt-0">
      <MobileSideNav nav={nav} menuLabel={t.nav.menu} linkClass={linkClass} />
    </div>
  );
}
