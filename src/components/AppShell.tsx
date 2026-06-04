import { ReactNode } from "react";
import { LogoutButton } from "./LogoutButton";
import { AppNav } from "./AppNav";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppShell({
  title,
  tagline,
  nav,
  children,
  userName,
}: {
  title: string;
  tagline: string;
  nav: { href: string; label: string }[];
  children: ReactNode;
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="border-b border-zinc-800 bg-black pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-amber-400 sm:text-2xl">{tagline}</h1>
            <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wide text-zinc-400 sm:text-sm">
              {title}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <span className="max-w-[12rem] truncate rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 sm:max-w-none">
              {userName}
            </span>
            <LogoutButton variant="light" />
          </div>
        </div>
        <AppNav nav={nav} />
      </header>
      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-6">{children}</main>
    </div>
  );
}
