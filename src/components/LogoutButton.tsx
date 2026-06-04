"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/LanguageProvider";

export function LogoutButton({ variant = "default" }: { variant?: "default" | "light" }) {
  const router = useRouter();
  const { t } = useTranslations();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const styles =
    variant === "light"
      ? "border-zinc-600 bg-zinc-900 text-zinc-300 hover:border-amber-500/50 hover:text-amber-300"
      : "border-zinc-600 bg-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:text-amber-300";

  return (
    <button
      type="button"
      onClick={logout}
      className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${styles}`}
    >
      {t.actions.logout}
    </button>
  );
}
