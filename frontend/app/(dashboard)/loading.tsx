// Shown while a dashboard page's server component streams in. The shapes
// mirror the real layout so the page does not visibly jump when it swaps in.
export default function DashboardLoading() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>

      {/* Welcome banner */}
      <div className="h-28 animate-pulse rounded-2xl border border-[#1e293b] bg-[#111827]" />

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-[#1e293b] bg-[#111827]"
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-[#1e293b] bg-[#111827]" />
        <div className="h-72 animate-pulse rounded-2xl border border-[#1e293b] bg-[#111827]" />
      </div>
    </div>
  );
}
