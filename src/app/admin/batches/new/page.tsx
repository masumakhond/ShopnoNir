"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  cardTitleClass,
  formErrorClass,
  mutedTextClass,
} from "@/components/ui";
import { MemberTagPicker } from "@/components/MemberTagPicker";
import { useTranslations } from "@/components/LanguageProvider";
import { getTotalDaysInBatch } from "@/lib/profit";
import { formatBDT } from "@/lib/money";

type Member = { id: string; memberNumber: number; name: string; active: boolean };

export default function NewBatchPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [mainSelected, setMainSelected] = useState<Set<string>>(new Set());
  const [additionalSelected, setAdditionalSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalProfit, setTotalProfit] = useState("");
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [trackingId, setTrackingId] = useState("");

  useEffect(() => {
    fetch("/api/batches/next-id")
      .then((r) => r.json())
      .then((d) => setTrackingId(d.trackingId || ""));
  }, []);

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => {
        const active = (d.members as Member[]).filter((m) => m.active);
        setMembers(active);
        setMainSelected(new Set(active.map((m) => m.id)));
      });
  }, []);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return getTotalDaysInBatch(new Date(startDate), new Date(endDate));
  }, [startDate, endDate]);

  const preview = useMemo(() => {
    const profit = Number(totalProfit) || 0;
    const count = Math.max(
      1,
      new Set([...mainSelected, ...additionalSelected]).size,
    );
    if (totalDays < 1) return null;
    const dailyProfit = profit / totalDays;
    const perMemberDaily = dailyProfit / count;
    return { dailyProfit, perMemberDaily, count };
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
    const fd = new FormData(e.currentTarget);
    const mainMemberIds = [...mainSelected];
    const additionalMemberIds = [...additionalSelected];
    const addAmount = Number(fd.get("additionalAmount") || additionalAmount) || 0;

    if (mainMemberIds.length === 0) {
      setError(t.batches.selectMainMember);
      return;
    }
    if (addAmount > 0 && additionalMemberIds.length === 0) {
      setError(t.batches.selectAdditionalMember);
      return;
    }

    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackingId: fd.get("trackingId") || undefined,
        name: fd.get("name") || undefined,
        startDate: fd.get("startDate"),
        endDate: fd.get("endDate"),
        totalAmount: Number(fd.get("totalAmount")),
        additionalAmount: addAmount,
        totalProfit: Number(fd.get("totalProfit")),
        mainMemberIds,
        additionalMemberIds,
        notes: fd.get("notes") || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(
        typeof data.error === "string"
          ? data.error === "This investment ID is already used"
            ? t.batches.trackingIdTaken
            : data.error
          : t.batches.createFailed,
      );
      return;
    }

    router.push("/admin/batches");
    router.refresh();
  }

  return (
    <Card>
      <h2 className={cardTitleClass}>{t.batches.createTitle}</h2>
      <p className={`mt-1 ${mutedTextClass}`}>{t.batches.durationHint}</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Input
          name="trackingId"
          label={t.batches.trackingId}
          placeholder={t.batches.trackingIdPlaceholder}
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
        <Input name="name" label={t.batches.name} placeholder={t.batches.namePlaceholder} />
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
        {totalDays > 0 ? (
          <p className="rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-300">
            {t.batches.duration}: <strong>{totalDays}</strong> {t.dashboard.daysTotal}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="totalAmount" label={t.batches.totalAmount} type="number" min={1} required />
          <Input
            name="additionalAmount"
            label={t.batches.additionalAmount}
            type="number"
            min={0}
            value={additionalAmount}
            onChange={(e) => setAdditionalAmount(e.target.value)}
          />
        </div>
        <p className="-mt-2 text-xs text-zinc-500">{t.batches.additionalAmountHint}</p>
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
            <p className="mt-1">
              {t.batches.perMemberDay}: <strong>{formatBDT(preview.perMemberDaily)}</strong>
            </p>
          </div>
        ) : null}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-400">{t.batches.notes}</span>
          <textarea
            name="notes"
            rows={2}
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
          onSelectAllAdditional={() =>
            setAdditionalSelected(new Set(members.map((m) => m.id)))
          }
        />

        {error ? <p className={formErrorClass}>{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit">{t.actions.create}</Button>
          <Button href="/admin/batches" variant="secondary">
            {t.actions.cancel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
