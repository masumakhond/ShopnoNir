"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, cardTitleClass, formErrorClass } from "@/components/ui";
import { useTranslations } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 sm:text-sm";

export default function NewMemberPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [error, setError] = useState("");
  const [createdLogin, setCreatedLogin] = useState<{
    username: string;
    email: string;
    password: string;
  } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCreatedLogin(null);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone") || null,
        nominee: fd.get("nominee") || null,
        nomineePhone: fd.get("nomineePhone") || null,
        nidNumber: fd.get("nidNumber") || null,
        address: fd.get("address") || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : t.contributions.failed);
      return;
    }

    const data = await res.json();
    setCreatedLogin(data.credentials ?? null);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <h2 className={cardTitleClass}>{t.members.addTitle}</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="name" label={t.members.fullName} required />
          <Input name="phone" label={t.members.phone} type="tel" />
          <Input name="nidNumber" label={t.account.nidNumber} />
          <Input name="nominee" label={t.account.nominee} />
          <Input name="nomineePhone" label={t.account.nomineePhone} type="tel" />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-400">{t.account.address}</span>
          <textarea name="address" rows={3} className={inputClass} />
        </label>
        {createdLogin ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm">
            <p className="font-semibold text-emerald-300">Member created with login:</p>
            <p className="mt-1 text-emerald-200">Username: {createdLogin.username}</p>
            <p className="text-emerald-200">Email: {createdLogin.email}</p>
            <p className="text-emerald-200">Password: {createdLogin.password}</p>
          </div>
        ) : null}
        {error ? <p className={formErrorClass}>{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit">{t.actions.save}</Button>
          <Button href="/admin/members" variant="secondary">
            {t.actions.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
