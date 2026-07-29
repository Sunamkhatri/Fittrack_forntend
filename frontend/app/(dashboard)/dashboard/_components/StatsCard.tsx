interface StatsCardProps {
  label: string;
  value: string | null;
  unit?: string;
  /** Marks a figure that is illustrative rather than the user's own data. */
  sample?: boolean;
}

export default function StatsCard({
  label,
  value,
  unit,
  sample = false,
}: StatsCardProps) {
  const hasValue = value !== null && value !== "";

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-400">{label}</p>
        {sample && hasValue && (
          // Without this the figure reads as the user's own logged data.
          <span
            className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
            title="Example figure — activity tracking is not implemented yet"
          >
            Sample
          </span>
        )}
      </div>

      {hasValue ? (
        <p className="mt-2 text-3xl font-bold text-[#00ff87]">
          {value}
          {unit && <span className="ml-1 text-lg text-slate-400">{unit}</span>}
        </p>
      ) : (
        <p className="mt-2 text-3xl font-bold text-slate-600" aria-label="No data yet">
          —
        </p>
      )}
    </div>
  );
}
