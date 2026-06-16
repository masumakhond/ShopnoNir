"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setResetUrl("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      setStatus(res.ok ? "success" : "error");

      if (!res.ok) {
        setMessage(
          typeof data.error === "string"
            ? data.error
            : "Could not start password reset."
        );
        return;
      }

      setMessage(data.message);
      setResetUrl(data.resetUrl || "");
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
      return;
    }

  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">Reset Password</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter the same username you use to sign in (for example{" "}
          <span className="text-zinc-300">masumbillahakhond</span>).
        </p>

        {status === "success" ? (
          <div className="mt-8 space-y-4 rounded-xl border border-green-500/30 bg-green-950/40 p-4">
            <p className="text-sm text-green-400">{message}</p>
            {resetUrl ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                  Accounts use <code className="text-zinc-300">@samiti.local</code> emails, so open
                  this link directly:
                </p>
                <Link
                  href={resetUrl}
                  className="block break-all text-sm font-medium text-amber-400 hover:underline"
                >
                  {resetUrl}
                </Link>
              </div>
            ) : null}
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-amber-500 hover:underline"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-400">Username or email</span>
              <input
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="masumbillahakhond"
                className="mt-1 w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 sm:py-2.5 sm:text-sm"
              />
            </label>

            {status === "error" && (
              <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-400">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {status === "loading" ? "Creating reset link..." : "Get reset link"}
            </button>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-zinc-400 transition hover:text-white">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
