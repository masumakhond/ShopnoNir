"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { useTranslations } from "@/components/LanguageProvider";

export function MemberActions({
  memberId,
  active,
  userRole = "MEMBER",
  userId,
  currentUserId,
  hasLogin,
}: {
  memberId: string;
  active: boolean;
  userRole?: "ADMIN" | "MEMBER";
  userId?: string | null;
  currentUserId: string;
  hasLogin: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = userRole === "ADMIN";
  const isSelf = userId === currentUserId;

  async function toggleActive() {
    setError("");
    setBusy(true);
    const res = await fetch(`/api/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : t.members.adminAccessFailed);
      return;
    }
    router.refresh();
  }

  async function toggleAdminAccess() {
    if (isSelf) return;
    const grant = !isAdmin;
    const msg = grant ? t.members.confirmGrantAdmin : t.members.confirmRevokeAdmin;
    if (!window.confirm(msg)) return;

    setError("");
    setBusy(true);
    const res = await fetch(`/api/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: grant ? "ADMIN" : "MEMBER" }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : t.members.adminAccessFailed);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {hasLogin ? (
          isAdmin ? (
            <Badge tone="info">{t.members.hasAdminAccess}</Badge>
          ) : null
        ) : null}
        <Button variant="secondary" onClick={toggleActive} disabled={busy}>
          {active ? t.actions.deactivate : t.actions.activate}
        </Button>
        {hasLogin && !isSelf ? (
          <Button
            variant={isAdmin ? "secondary" : "primary"}
            onClick={toggleAdminAccess}
            disabled={busy}
          >
            {isAdmin ? t.members.revokeAdminAccess : t.members.grantAdminAccess}
          </Button>
        ) : null}
      </div>
      {isSelf ? (
        <p className="max-w-xs text-right text-xs text-zinc-500">{t.members.cannotChangeOwnAdmin}</p>
      ) : null}
      {error ? <p className="max-w-xs text-right text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
