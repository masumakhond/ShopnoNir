"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or expired reset link. Please request a new one.");
      setStatus("error");
    }
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setStatus("loading");
    setMessage("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Could not update password.");
      return;
    }

    router.push("/login?reset=success");
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl sm:p-8">
      <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">Set New Password</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Enter your new password below to regain access.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-zinc-400">New Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!token}
            className="mt-1 w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-3 text-base text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 sm:py-2.5 sm:text-sm"
          />
        </label>

        {status === "error" && (
          <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-400">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !token}
          className="w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
        >
          {status === "loading" ? "Updating..." : "Update Password"}
        </button>

        {!token ? (
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-amber-500 hover:underline">
              Request a new reset link
            </Link>
          </div>
        ) : null}
      </form>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
        <UpdatePasswordForm />
      </Suspense>
    </div>
  );
}
