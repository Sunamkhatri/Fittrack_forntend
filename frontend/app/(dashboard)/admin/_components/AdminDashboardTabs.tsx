"use client";
import { useState } from "react";

export default function AdminDashboardTabs({ users, trainers, revenueData }: any) {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-2xl">
      <div className="flex overflow-x-auto border-b border-[#1e293b] hide-scrollbar">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 whitespace-nowrap px-6 py-5 text-sm font-bold transition-all ${
            activeTab === "users" ? "border-b-2 border-[#00ff87] text-[#00ff87] bg-[#00ff87]/5" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Registered Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("trainers")}
          className={`flex-1 whitespace-nowrap px-6 py-5 text-sm font-bold transition-all ${
            activeTab === "trainers" ? "border-b-2 border-[#00ff87] text-[#00ff87] bg-[#00ff87]/5" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Active Trainers ({trainers.length})
        </button>
      </div>

      <div className="p-6">
        {activeTab === "users" && (
          <div className="space-y-4 animate-in fade-in">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between rounded-xl border border-[#1e293b] bg-[#111827] p-5 transition hover:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 font-bold text-white">
                    {u.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{u.firstName} {u.lastName}</p>
                    <p className="text-sm text-slate-400">{u.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-800/80 px-4 py-1.5 text-xs font-bold text-slate-300">USER</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "trainers" && (
          <div className="space-y-4 animate-in fade-in">
            {trainers.map((t: any) => (
              <div key={t._id} className="flex items-center justify-between rounded-xl border border-[#1e293b] bg-[#111827] p-5 transition hover:border-[#00ff87]/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00ff87]/20 font-bold text-[#00ff87]">
                    {t.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#00ff87]">{t.firstName} {t.lastName}</p>
                    <p className="text-sm text-slate-400">{t.email} <span className="mx-2">•</span> {t.specialty || "General Fitness"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#00ff87]/10 px-4 py-1.5 text-xs font-bold tracking-wide text-[#00ff87]">TRAINER</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
