"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  PageHeader,
  cardTitleClass,
  mutedTextClass,
  profitTextClass,
} from "@/components/ui";
import {
  MobileCardList,
  MobileCard,
  ResponsiveTable,
} from "@/components/ResponsiveTable";
import { formatBDT } from "@/lib/money";
import { formatMonthYear } from "@/lib/i18n";
import { useTranslations } from "@/components/LanguageProvider";

type Member = { id: string; memberNumber: number; name: string };
type Contribution = {
  id: string;
  year: number;
  month: number;
  amount: string;
  member: Member;
};

async function readError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    if (typeof data.error === "string") return data.error;
  } catch {
    /* ignore */
  }
  return fallback;
}

export default function ContributionsPage() {
  const { t, locale } = useTranslations();
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [message, setMessage] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editing, setEditing] = useState<Contribution | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const [mRes, cRes] = await Promise.all([
      fetch("/api/members"),
      fetch("/api/contributions"),
    ]);
    const mData = await mRes.json();
    const cData = await cRes.json();
    setMembers(mData.members || []);
    setContributions(cData.contributions || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: fd.get("memberId"),
        year: Number(fd.get("year")),
        month: Number(fd.get("month")),
        amount: Number(fd.get("amount")),
      }),
    });
    if (!res.ok) {
      setMessage(await readError(res, t.contributions.failed));
      return;
    }
    setMessage(t.contributions.saved);
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function onBulkSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setBulkLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contributions/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year: Number(fd.get("bulkYear")),
        month: Number(fd.get("bulkMonth")),
        amount: Number(fd.get("bulkAmount")),
      }),
    });
    setBulkLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setMessage(t.contributions.bulkFailed);
      return;
    }
    setMessage(t.contributions.bulkResult(data.created, data.skipped));
    load();
  }

  async function onEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setMessage("");
    setEditSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/contributions/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: fd.get("memberId"),
        year: Number(fd.get("year")),
        month: Number(fd.get("month")),
        amount: Number(fd.get("amount")),
      }),
    });
    setEditSaving(false);
    if (!res.ok) {
      const err = await readError(res, t.contributions.updateFailed);
      setMessage(res.status === 409 ? t.contributions.duplicatePeriod : err);
      return;
    }
    setMessage(t.contributions.updated);
    setEditing(null);
    load();
  }

  async function onDelete(contribution: Contribution) {
    if (!window.confirm(t.actions.confirmDeleteContribution)) return;
    setMessage("");
    setDeletingId(contribution.id);
    const res = await fetch(`/api/contributions/${contribution.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      setMessage(await readError(res, t.contributions.deleteFailed));
      return;
    }
    if (editing?.id === contribution.id) setEditing(null);
    setMessage(t.contributions.deleted);
    load();
  }

  function RowActions({ c }: { c: Contribution }) {
    const busy = deletingId === c.id;
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-9 px-3 py-1.5 text-xs"
          onClick={() => {
            setEditing(c);
            setMessage("");
          }}
          disabled={busy}
        >
          {t.actions.edit}
        </Button>
        <Button
          variant="danger"
          className="min-h-9 px-3 py-1.5 text-xs"
          onClick={() => onDelete(c)}
          disabled={busy}
        >
          {busy ? "…" : t.actions.delete}
        </Button>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader title={t.contributions.pageTitle} subtitle={t.contributions.pageSubtitle} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className={cardTitleClass}>{t.contributions.bulkTitle}</h2>
          <p className={`mt-1 ${mutedTextClass}`}>{t.contributions.bulkHint}</p>
          <form onSubmit={onBulkSubmit} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="bulkYear"
                label={t.contributions.year}
                type="number"
                defaultValue={now.getFullYear()}
                required
              />
              <Input
                name="bulkMonth"
                label={t.contributions.month}
                type="number"
                min={1}
                max={12}
                defaultValue={now.getMonth() + 1}
                required
              />
            </div>
            <Input
              name="bulkAmount"
              label={t.contributions.amount}
              type="number"
              defaultValue={5000}
              required
            />
            <Button type="submit" disabled={bulkLoading}>
              {bulkLoading ? "…" : t.actions.recordAll32}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className={cardTitleClass}>{t.contributions.recordTitle}</h2>
          <p className={`mt-1 ${mutedTextClass}`}>{t.contributions.standardHint}</p>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <Select name="memberId" label={t.contributions.member} required defaultValue="">
              <option value="" disabled>
                {t.contributions.selectMember}
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  #{m.memberNumber} — {m.name}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="year"
                label={t.contributions.year}
                type="number"
                defaultValue={now.getFullYear()}
                required
              />
              <Input
                name="month"
                label={t.contributions.month}
                type="number"
                min={1}
                max={12}
                defaultValue={now.getMonth() + 1}
                required
              />
            </div>
            <Input
              name="amount"
              label={t.contributions.amount}
              type="number"
              defaultValue={5000}
              required
            />
            <Button type="submit">{t.actions.recordContribution}</Button>
          </form>
        </Card>
      </div>

      {message ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-300">
          {message}
        </p>
      ) : null}

      {editing ? (
        <Card className="border-amber-500/40">
          <h2 className={cardTitleClass}>{t.contributions.editTitle}</h2>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>
            #{editing.member.memberNumber} {editing.member.name} ·{" "}
            {formatMonthYear(locale, editing.year, editing.month)}
          </p>
          <form key={editing.id} onSubmit={onEditSubmit} className="mt-4 space-y-3">
            <Select
              name="memberId"
              label={t.contributions.member}
              required
              defaultValue={editing.member.id}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  #{m.memberNumber} — {m.name}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="year"
                label={t.contributions.year}
                type="number"
                defaultValue={editing.year}
                required
              />
              <Input
                name="month"
                label={t.contributions.month}
                type="number"
                min={1}
                max={12}
                defaultValue={editing.month}
                required
              />
            </div>
            <Input
              name="amount"
              label={t.contributions.amount}
              type="number"
              defaultValue={Number(editing.amount)}
              required
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={editSaving}>
                {editSaving ? "…" : t.actions.save}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                {t.actions.cancel}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <h2 className={cardTitleClass}>{t.members.contributionsTitle}</h2>
        {contributions.length === 0 ? (
          <p className={`mt-2 ${mutedTextClass}`}>{t.contributions.noRecords}</p>
        ) : (
          <>
            <MobileCardList>
              {contributions.map((c) => (
                <MobileCard key={c.id}>
                  <p className="font-semibold text-white">
                    #{c.member.memberNumber} {c.member.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">
                      {formatMonthYear(locale, c.year, c.month)}
                    </span>
                    <span className={profitTextClass}>{formatBDT(Number(c.amount))}</span>
                  </div>
                  <div className="mt-3 border-t border-zinc-700 pt-3">
                    <RowActions c={c} />
                  </div>
                </MobileCard>
              ))}
            </MobileCardList>

            <div className="mt-4 hidden overflow-x-auto md:block">
              <ResponsiveTable>
                <thead className="bg-zinc-800 text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 text-left">{t.contributions.member}</th>
                    <th className="px-4 py-3 text-left">{t.contributions.period}</th>
                    <th className="px-4 py-3 text-right">{t.contributions.amount}</th>
                    <th className="px-4 py-3 text-right">{t.contributions.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c) => (
                    <tr key={c.id} className="border-t border-zinc-700 hover:bg-zinc-800/80">
                      <td className="px-4 py-2 text-zinc-200">
                        #{c.member.memberNumber} {c.member.name}
                      </td>
                      <td className="px-4 py-2 text-zinc-400">
                        {formatMonthYear(locale, c.year, c.month)}
                      </td>
                      <td className={`px-4 py-2 text-right ${profitTextClass}`}>
                        {formatBDT(Number(c.amount))}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end">
                          <RowActions c={c} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ResponsiveTable>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
