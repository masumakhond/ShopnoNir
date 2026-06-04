"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string };

export function MobileSideNav({
  nav,
  menuLabel,
  linkClass,
}: {
  nav: NavItem[];
  menuLabel: string;
  linkClass: (href: string) => string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between py-2 md:hidden">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {menuLabel}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-200"
          aria-expanded={open}
          aria-controls="mobile-side-nav"
          aria-label={menuLabel}
        >
          ☰
        </button>
      </div>

      <div className="scrollbar-thin hidden flex-row items-center gap-2 overflow-x-auto pb-2 pt-3 md:flex">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap ${linkClass(item.href)}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden={!open}
      />

      <aside
        id="mobile-side-nav"
        role="dialog"
        aria-modal="true"
        aria-label={menuLabel}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(288px,88vw)] flex-col border-r border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          <span className="text-sm font-bold uppercase tracking-wide text-amber-400">
            {menuLabel}
          </span>
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm font-semibold text-zinc-300"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={linkClass(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
