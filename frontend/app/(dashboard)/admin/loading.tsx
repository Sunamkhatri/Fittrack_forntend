// The admin table hits the API for a paginated page of users, so it is the
// slowest route in the app and the one most in need of a placeholder.
export default function AdminLoading() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading users…</span>

      <div className="h-10 w-56 animate-pulse rounded-lg bg-[#111827]" />

      {/* Search + page-size controls */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-[#111827]" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-[#111827]" />
      </div>

      {/* Table rows */}
      <div className="overflow-hidden rounded-xl border border-[#1e293b]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse border-b border-[#1e293b] bg-[#111827] last:border-b-0"
          />
        ))}
      </div>
    </div>
  );
}
