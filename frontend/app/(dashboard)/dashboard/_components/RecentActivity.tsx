import { Dumbbell, Utensils, Target, Droplets } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    { id: 1, type: "workout", title: "Upper Body Strength", time: "2 hours ago", value: "45 min", icon: Dumbbell, color: "text-[#00ff87]" },
    { id: 2, type: "meal", title: "Grilled Chicken Salad", time: "4 hours ago", value: "450 kcal", icon: Utensils, color: "text-orange-400" },
    { id: 3, type: "water", title: "Hydration", time: "5 hours ago", value: "500 ml", icon: Droplets, color: "text-blue-400" },
    { id: 4, type: "weight", title: "Weight Update", time: "1 day ago", value: "75.2 kg", icon: Target, color: "text-purple-400" },
  ];

  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-center justify-between rounded-lg border border-[#1e293b] p-4 hover:bg-[#1e293b]/30">
              <div className="flex items-center gap-4">
                <div className={`rounded-full bg-[#1e293b] p-2 ${activity.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
              <div className="text-sm font-bold text-white">{activity.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
