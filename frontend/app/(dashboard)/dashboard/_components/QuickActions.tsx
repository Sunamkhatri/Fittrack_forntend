import { Plus, Dumbbell, Droplets, Target, User } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    { name: "Start Workout", icon: Dumbbell, color: "text-[#00ff87]", bg: "bg-[#00ff87]/10", href: "/workouts/new" },
    { name: "Log Meal", icon: Plus, color: "text-orange-400", bg: "bg-orange-500/10", href: "/nutrition/new" },
    { name: "Add Water", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10", href: "/nutrition" },
    { name: "Update Weight", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", href: "/progress" },
    { name: "Edit Profile", icon: User, color: "text-slate-400", bg: "bg-slate-500/10", href: "/profile" },
  ];

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              href={action.href}
              className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-[#1e293b] p-4 text-center transition hover:border-[#00ff87]/50 hover:bg-[#1e293b]/50"
            >
              <div className={`rounded-full p-3 transition group-hover:scale-110 ${action.bg} ${action.color}`}>
                <Icon size={24} />
              </div>
              <span className="text-xs font-medium text-slate-300">{action.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
