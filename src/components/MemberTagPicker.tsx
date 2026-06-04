"use client";

import { useTranslations } from "@/components/LanguageProvider";

type Member = { id: string; memberNumber: number; name: string };

export function MemberTagPicker({
  members,
  mainSelected,
  additionalSelected,
  onToggleMain,
  onToggleAdditional,
  onSelectAllMain,
  onSelectAllAdditional,
}: {
  members: Member[];
  mainSelected: Set<string>;
  additionalSelected: Set<string>;
  onToggleMain: (id: string) => void;
  onToggleAdditional: (id: string) => void;
  onSelectAllMain: () => void;
  onSelectAllAdditional: () => void;
}) {
  const { t } = useTranslations();

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-sky-400">{t.batches.tagMainMembers}</span>
          <button
            type="button"
            onClick={onSelectAllMain}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            {t.actions.selectAll} ({members.length})
          </button>
        </div>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-sky-500/30 bg-zinc-950 p-3">
          {members.map((m) => (
            <label
              key={`main-${m.id}`}
              className="flex cursor-pointer items-center gap-2 border-b border-zinc-800 py-2 text-sm text-zinc-200 last:border-0"
            >
              <input
                type="checkbox"
                checked={mainSelected.has(m.id)}
                onChange={() => onToggleMain(m.id)}
              />
              <span>
                #{m.memberNumber} — {m.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-violet-400">{t.batches.tagAdditionalMembers}</span>
          <button
            type="button"
            onClick={onSelectAllAdditional}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            {t.actions.selectAll} ({members.length})
          </button>
        </div>
        <p className="mb-2 text-xs text-zinc-500">{t.batches.tagAdditionalHint}</p>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-violet-500/30 bg-zinc-950 p-3">
          {members.map((m) => (
            <label
              key={`add-${m.id}`}
              className="flex cursor-pointer items-center gap-2 border-b border-zinc-800 py-2 text-sm text-zinc-200 last:border-0"
            >
              <input
                type="checkbox"
                checked={additionalSelected.has(m.id)}
                onChange={() => onToggleAdditional(m.id)}
              />
              <span>
                #{m.memberNumber} — {m.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
