"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js"; // Adjust based on your setup
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Initialize Supabase (Use your existing client if you have one exported)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Check your email for the password reset link.");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <h1 className="text-2xl font-bold text-amber-400 sm:text-3xl">Reset Password</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {status === "success" ? (
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-950/40 p-4 text-center">
            <p className="text-sm text-green-400">{message}</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-medium text-amber-500 hover:underline">
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-400">Email Address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}