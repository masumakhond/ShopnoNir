"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Input,
  cardTitleClass,
  formErrorClass,
  mutedTextClass,
} from "@/components/ui";
import { useTranslations } from "@/components/LanguageProvider";
import type { ProfileDto } from "@/lib/profile";

const inputClass =
  "normal-case w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 sm:text-sm";

type FormFields = {
  name: string;
  loginUsername: string;
  phone: string;
  nominee: string;
  nomineePhone: string;
  nidNumber: string;
  address: string;
  password: string;
};

function fieldsFromProfile(profile: ProfileDto): FormFields {
  return {
    name: profile.name,
    loginUsername: profile.username,
    phone: profile.phone ?? "",
    nominee: profile.nominee ?? "",
    nomineePhone: profile.nomineePhone ?? "",
    nidNumber: profile.nidNumber ?? "",
    address: profile.address ?? "",
    password: "",
  };
}

type ProfileFormProps = {
  /** Admin editing a member by id. Omit for own account (/api/account). */
  memberId?: string;
  showTitle?: boolean;
};

export function ProfileForm({ memberId, showTitle = true }: ProfileFormProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [fields, setFields] = useState<FormFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUrl = memberId ? `/api/members/${memberId}/profile` : "/api/account";
  const saveUrl = loadUrl;

  useEffect(() => {
    setLoading(true);
    setProfile(null);
    setFields(null);
    setMessage("");
    setError("");

    void (async () => {
      const res = await fetch(loadUrl);
      if (!res.ok) {
        setError(t.account.loadFailed);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProfile(data.profile);
      setFields(fieldsFromProfile(data.profile));
      setLoading(false);
    })();
  }, [loadUrl, t.account.loadFailed]);

  function updateField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile || !fields) return;
    setMessage("");
    setError("");
    setSaving(true);

    const payload: Record<string, string | null> = {
      name: fields.name,
      email: fields.loginUsername,
      phone: fields.phone.trim() || null,
      nominee: fields.nominee.trim() || null,
      nomineePhone: fields.nomineePhone.trim() || null,
      nidNumber: fields.nidNumber.trim() || null,
      address: fields.address.trim() || null,
    };
    if (fields.password.length >= 6) payload.password = fields.password;

    const res = await fetch(saveUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : t.account.saveFailed);
      return;
    }
    setProfile(data.profile);
    setFields(fieldsFromProfile(data.profile));
    setMessage(t.account.saved);
    router.refresh();
  }

  if (loading) {
    return <p className={mutedTextClass}>{t.account.loading}</p>;
  }

  if (!profile || !fields) {
    return <p className={formErrorClass}>{error || t.account.loadFailed}</p>;
  }

  const isAdminAccount = profile.role === "ADMIN" && profile.memberNumber == null;

  return (
    <Card>
      {showTitle ? (
        <>
          <h2 className={cardTitleClass}>{t.account.title}</h2>
          <p className={`mt-1 ${mutedTextClass}`}>{t.account.subtitle}</p>
        </>
      ) : null}

      <form onSubmit={onSubmit} className={`space-y-4 ${showTitle ? "mt-5" : "mt-0"}`}>
        {profile.memberNumber != null ? (
          <div>
            <span className="text-sm font-medium text-zinc-400">{t.members.memberNumber}</span>
            <p className="mt-1 text-2xl font-bold text-amber-300">#{profile.memberNumber}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{t.account.memberNumberHint}</p>
          </div>
        ) : (
          <div>
            <Badge tone="info">{t.account.roleAdmin}</Badge>
            <p className="mt-2 text-xs text-zinc-500">{t.account.adminHint}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="name"
            label={t.members.fullName}
            value={fields.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            autoCapitalize="words"
            autoCorrect="off"
            className="normal-case"
          />

          <div>
            <Input
              name="loginUsername"
              label={t.account.loginUsername}
              value={fields.loginUsername}
              onChange={(e) => updateField("loginUsername", e.target.value)}
              required
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="normal-case"
            />
            <p className="mt-1 text-xs text-zinc-500">{t.account.usernameHint}</p>
            <p className="mt-1 text-xs text-zinc-600">
              {t.account.currentLogin}: <span className="text-zinc-400">{profile.email}</span>
            </p>
          </div>

          <Input
            name="phone"
            label={t.members.phone}
            type="tel"
            value={fields.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            autoComplete="tel"
            autoCapitalize="none"
            className="normal-case"
          />

          <Input
            name="nidNumber"
            label={t.account.nidNumber}
            value={fields.nidNumber}
            onChange={(e) => updateField("nidNumber", e.target.value)}
            autoCapitalize="none"
            className="normal-case"
          />

          <Input
            name="nominee"
            label={t.account.nominee}
            value={fields.nominee}
            onChange={(e) => updateField("nominee", e.target.value)}
            autoCapitalize="words"
            autoCorrect="off"
            className="normal-case"
          />

          <Input
            name="nomineePhone"
            label={t.account.nomineePhone}
            type="tel"
            value={fields.nomineePhone}
            onChange={(e) => updateField("nomineePhone", e.target.value)}
            autoCapitalize="none"
            className="normal-case"
          />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-400">{t.account.address}</span>
          <textarea
            name="address"
            rows={3}
            value={fields.address}
            onChange={(e) => updateField("address", e.target.value)}
            className={inputClass}
            placeholder={t.account.addressPlaceholder}
            autoCapitalize="sentences"
          />
        </label>

        <div>
          <Input
            name="password"
            label={t.account.newPassword}
            type="password"
            value={fields.password}
            onChange={(e) => updateField("password", e.target.value)}
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-zinc-500">{t.account.passwordHint}</p>
        </div>

        {isAdminAccount ? null : (
          <p className="text-xs text-zinc-500">{t.account.memberContactNote}</p>
        )}

        {error ? <p className={formErrorClass}>{error}</p> : null}
        {message ? (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={saving}>
          {saving ? "…" : t.actions.save}
        </Button>
      </form>
    </Card>
  );
}
