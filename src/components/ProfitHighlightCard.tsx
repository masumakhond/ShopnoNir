import { formatBDT } from "@/lib/money";

export function ProfitHighlightCard({
  label,
  value,
  hint,
  badge,
  subtext,
  compact = true,
}: {
  label: string;
  value: number;
  hint?: string;
  badge?: string;
  subtext?: string;
  /** Same size as other stat cards (default). */
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-amber-400/50 bg-gradient-to-br from-amber-500/25 via-amber-600/15 to-zinc-950 shadow-lg shadow-black/40 ${
        compact ? "p-4 sm:p-5" : "p-5 shadow-xl sm:p-6"
      }`}
      role="status"
      aria-live="polite"
    >
      <div>
        {badge ? (
          <span className="mb-1.5 inline-flex items-center rounded-full border border-amber-400/60 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300 sm:text-xs">
            {badge}
          </span>
        ) : null}
        <p className="text-sm font-semibold text-amber-200/90">{label}</p>
        <p
          className={`animate-profit-text mt-1 font-bold tracking-tight ${
            compact ? "text-2xl sm:text-3xl" : "mt-2 text-3xl font-extrabold sm:text-4xl"
          }`}
        >
          {formatBDT(value)}
        </p>
        {!compact && subtext ? (
          <p className="mt-2 text-sm font-medium text-amber-100/80">{subtext}</p>
        ) : null}
        {hint ? <p className="mt-1.5 text-xs text-zinc-400">{hint}</p> : null}
      </div>
    </div>
  );
}
