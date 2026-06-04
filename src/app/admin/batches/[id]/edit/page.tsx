"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, Button, Input, cardTitleClass, formErrorClass, mutedTextClass } from "@/components/ui";
import { MemberTagPicker } from "@/components/MemberTagPicker";
import { useTranslations } from "@/components/LanguageProvider";
import { getTotalDaysInBatch } from "@/lib/profit";
import { formatBDT } from "@/lib/money";

type Member = { id: string; memberNumber: number; name: string; active: boolean };

function toDateInput(d: string | Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default function EditBatchPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const batchId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [mainSelected, setMainSelected] = useState<Set<string>>(new Set());
  const [additionalSelected, setAdditionalSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalProfit, setTotalProfit] = useState("");
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [defaults, setDefaults] = useState({
    name: "",
    totalAmount: "",
    notes: "",
  });

  useEffect(() => {
    async function load() {
      const [mRes, bRes] = await Promise.all([
        fetch("/api/members"),
        fetch(`/api/batches/${batchId}`),
      ]);
      const mData = await mRes.json();
      const bData = await bRes.json();
      if (!bRes.ok) {
        setError(t.batches.updateFailed);
        setLoading(false);
        return;
      }

      const active = (mData.members as Member[]).filter((m) => m.active);
      setMembers(active);

      const batch = bData.batch;
      const pools = bData.pools as { mainMemberIds: string[]; additionalMemberIds: string[] };
      setMainSelected(new Set(pools?.mainMemberIds ?? []));
      setAdditionalSelected(new Set(pools?.additionalMemberIds ?? []));
      setStartDate(toDateInput(batch.startDate));
      setEndDate(toDateInput(batch.endDate));
      setTotalProfit(String(batch.totalProfit));
      setAdditionalAmount(String(batch.additionalAmount ?? 0));
      setTrackingId(batch.trackingId || "");
      setDefaults({
        name: batch.name || "",
        totalAmount: String(batch.totalAmount),
        notes: batch.notes || "",
      });
      setLoading(false);
    }
    load();
  }, [batchId, t.batches.updateFailed]);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return getTotalDaysInBatch(new Date(startDate), new Date(endDate));
  }, [startDate, endDate]);

  const preview = useMemo(() => {
    const profit = Number(totalProfit) || 0;
    const count = Math.max(1, new Set([...mainSelected, ...additionalSelected]).size);
    if (totalDays < 1) return null;
    const dailyProfit = profit / totalDays;
    return { dailyProfit, perMemberDaily: dailyProfit / count };
  }, [totalProfit, totalDays, mainSelected, additionalSelected]);

  function toggleMain(id: string) {
    setMainSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAdditional(id: string) {
    setAdditionalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const mainMemberIds = [...mainSelected];
    const additionalMemberIds = [...additionalSelected];
    const addAmount = Number(additionalAmount) || 0;

    if (mainMemberIds.length === 0) {
      setError(t.batches.selectMainMember);
      return;
    }
    if (addAmount > 0 && additionalMemberIds.length === 0) {
      setError(t.batches.selectAdditionalMember);
      return;
    }

    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/batches/${batchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId: trackingId.trim() || fd.get("trackingId"),
        name: fd.get("name") || null,
        startDate: fd.get("startDate"),
        endDate: fd.get("endDate"),
        totalAmount: Number(fd.get("totalAmount")),
        additionalAmount: addAmount,
        totalProfit: Number(fd.get("totalProfit")),
        mainMemberIds,
        additionalMemberIds,
        notes: fd.get("notes") || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string" && data.error.includes("ID")
          ? t.batches.trackingIdTaken
          : t.batches.updateFailed,
      );
      return;
    }

    router.push(`/admin/batches/${batchId}`);
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-zinc-400">…</p>;
  }

  return (
    <Card>
      <h2 className={cardTitleClass}>{t.batches.editTitle}</h2>
      <p className={`mt-1 ${mutedTextClass}`}>{t.batches.durationHint}</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Input
          name="trackingId"
          label={t.batches.trackingId}
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          required
        />
        <Input name="name" label={t.batches.name} defaultValue={defaults.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="startDate"
            label={t.batches.startDate}
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            name="endDate"
            label={t.batches.endDate}
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="totalAmount"
            label={t.batches.totalAmount}
            type="number"
            min={1}
            required
            defaultValue={defaults.totalAmount}
          />
          <Input
            name="additionalAmount"
            label={t.batches.additionalAmount}
            type="number"
            min={0}
            value={additionalAmount}
            onChange={(e) => setAdditionalAmount(e.target.value)}
          />
        </div>
        <Input
          name="totalProfit"
          label={t.batches.totalProfit}
          type="number"
          min={0}
          step="0.01"
          required
          value={totalProfit}
          onChange={(e) => setTotalProfit(e.target.value)}
        />
        {preview ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            <p>
              {t.batches.dailyFundProfit}: <strong>{formatBDT(preview.dailyProfit)}</strong>
            </p>
          </div>
        ) : null}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-400">{t.batches.notes}</span>
          <textarea
            name="notes"
            rows={2}
            defaultValue={defaults.notes}
            className="w-full rounded-xl border border-zinc-600 bg-zinc-950 px-3 py-2 text-sm text-white"
          />
        </label>

        <MemberTagPicker
          members={members}
          mainSelected={mainSelected}
          additionalSelected={additionalSelected}
          onToggleMain={toggleMain}
          onToggleAdditional={toggleAdditional}
          onSelectAllMain={() => setMainSelected(new Set(members.map((m) => m.id)))}
          onSelectAllAdditional={() => setAdditionalSelected(new Set(members.map((m) => m.id)))}
        />

        {error ? <p className={formErrorClass}>{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit">{t.actions.save}</Button>
          <Button href={`/admin/batches/${batchId}`} variant="secondary">
            {t.actions.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
