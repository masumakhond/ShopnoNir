"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useTranslations } from "@/components/LanguageProvider";

export function BatchActions({
  batchId,
  status,
  closedAt,
}: {
  batchId: string;
  status: string;
  closedAt: string | null;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [closing, setClosing] = useState(false);

  const isClosed = status === "COMPLETED" || Boolean(closedAt);

  async function onClose() {
    if (!window.confirm(t.batches.confirmCloseInvestment)) return;
    setClosing(true);
    const res = await fetch(`/api/batches/${batchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ close: true }),
    });
    setClosing(false);
    if (!res.ok) {
      alert(t.batches.closeFailed);
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    if (!window.confirm(t.actions.confirmDeleteBatch)) return;
    setDeleting(true);
    const res = await fetch(`/api/batches/${batchId}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      alert(t.batches.deleteFailed);
      return;
    }
    router.push("/admin/batches");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isClosed ? (
        <Button variant="secondary" onClick={onClose} disabled={closing || deleting}>
          {closing ? "…" : t.batches.closeInvestment}
        </Button>
      ) : null}
      <Button href={`/admin/batches/${batchId}/edit`} variant="secondary">
        {t.actions.edit}
      </Button>
      <Button variant="danger" onClick={onDelete} disabled={deleting || closing}>
        {deleting ? "…" : t.actions.delete}
      </Button>
    </div>
  );
}
