"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <-- Added Next.js Link
import { useTranslations } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t.login.failed);
      return;
    }

    router.push(data.redirect);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">{t.appName}</h1>
        <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {t.login.title}
        </p>
        <p className="mt-2 text-sm text-zinc-400">{t.login.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-400">{t.login.username}</span>
            <input
              type="text"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 sm:py-2.5 sm:text-sm"
              placeholder="masumbillahakhond"
            />
          </label>
          <label className="block">
            {/* Added Flexbox to align label and Forgot Password link */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-400">{t.login.password}</span>
              <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-amber-500 transition hover:text-amber-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-3 text-base text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 sm:py-2.5 sm:text-sm"
            />
          </label>
          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {loading ? t.actions.signingIn : t.actions.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}