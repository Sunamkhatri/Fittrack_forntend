interface StatsCardProps {
  label: string;
  value: string;
  unit?: string;
}

export default function StatsCard({ label, value, unit }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#00ff87]">
        {value}
        {unit && <span className="ml-1 text-lg text-slate-400">{unit}</span>}
      </p>
    </div>
  );
}
