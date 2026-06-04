import { BatchTrackingBadge } from "@/components/BatchTrackingBadge";
import { getTranslations } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { format } from "date-fns";

type MissedBatch = {
  id: string;
  trackingId: string;
  name: string | null;
  startDate: Date;
  endDate: Date;
};

export async function MissedBatchesList({ batches }: { batches: MissedBatch[] }) {
  const t = getTranslations(await getLocale());

  if (batches.length === 0) {
    return <p className="text-sm text-sky-400">{t.participation.noMissed}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-amber-400/90">{t.participation.missedHint}</p>
      <ul className="space-y-2">
        {batches.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/25 bg-zinc-800/50 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <BatchTrackingBadge trackingId={b.trackingId} />
              <span className="text-zinc-200">{b.name || t.batches.investmentBatch}</span>
            </div>
            <span className="text-xs text-zinc-500">
              {format(b.startDate, "dd MMM yyyy")} – {format(b.endDate, "dd MMM yyyy")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
