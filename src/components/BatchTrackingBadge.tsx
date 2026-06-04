export function BatchTrackingBadge({ trackingId }: { trackingId: string }) {
  return (
    <span className="inline-flex rounded-lg border border-zinc-600 bg-zinc-950 px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-amber-400">
      {trackingId}
    </span>
  );
}
