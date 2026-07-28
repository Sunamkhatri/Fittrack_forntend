"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const weeklyData = [
  { day: "Mon", calories: 2100, workouts: 45, water: 2.5, weight: 75.5 },
  { day: "Tue", calories: 1950, workouts: 30, water: 3.0, weight: 75.4 },
  { day: "Wed", calories: 2400, workouts: 60, water: 2.8, weight: 75.2 },
  { day: "Thu", calories: 1800, workouts: 0, water: 2.0, weight: 75.3 },
  { day: "Fri", calories: 2200, workouts: 45, water: 3.5, weight: 75.1 },
  { day: "Sat", calories: 2600, workouts: 90, water: 4.0, weight: 75.0 },
  { day: "Sun", calories: 2100, workouts: 30, water: 2.5, weight: 74.9 },
];

export default function WeeklyCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Calories Chart */}
      <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
        <h3 className="mb-6 text-lg font-semibold text-white">
          Calories Consumed vs. Burned
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                cursor={{ fill: "#1e293b", opacity: 0.4 }}
              />
              <Bar dataKey="calories" fill="#00ff87" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight Trend */}
      <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
        <h3 className="mb-6 text-lg font-semibold text-white">Weight Trend (kg)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#111827" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
