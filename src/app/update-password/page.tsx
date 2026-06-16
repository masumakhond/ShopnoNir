"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  // Check if we actually have a session hash from the email link
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      setMessage("Invalid or expired reset link. Please request a new one.");
      setStatus("error");
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    // Success! Redirect them to login
    router.push("/login?reset=success");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

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
              className="mt-1 w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-3 text-base text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 sm:py-2.5 sm:text-sm"
            />
          </label>

          {status === "error" && (
            <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || status === "error"}
            className="w-full rounded-xl bg-amber-400 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {status === "loading" ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}s