"use client";

import { useState } from "react";
import { Dumbbell, Clock, Star, ShoppingCart, Plus, Check } from "lucide-react";
import SubscribeButton from "./SubscribeButton";

const SESSION_TYPES = [
  { name: "Single Session", duration: "1 hour", multiplier: 1 },
  { name: "Weekly Plan", duration: "4 sessions", multiplier: 3.5 },
  { name: "Monthly Plan", duration: "16 sessions", multiplier: 12 },
];

export default function TrainerCard({ trainer }: { trainer: any }) {
  const [addedSessions, setAddedSessions] = useState<string[]>([]);

  const addToCart = (sessionType: typeof SESSION_TYPES[0]) => {
    const cart = JSON.parse(localStorage.getItem("fittrack_cart") || "[]");
    const itemId = `${trainer._id}_${sessionType.name}`;

    // Prevent duplicate
    if (cart.find((c: any) => c.id === itemId)) return;

    cart.push({
      id: itemId,
      trainerName: `${trainer.firstName || ""} ${trainer.lastName || ""}`.trim() || trainer.name,
      trainerId: trainer._id,
      sessionType: sessionType.name,
      duration: sessionType.duration,
      price: Math.round((trainer.hourlyRate || 500) * sessionType.multiplier),
    });

    localStorage.setItem("fittrack_cart", JSON.stringify(cart));
    setAddedSessions([...addedSessions, sessionType.name]);

    // Trigger cart update across components
    window.dispatchEvent(new Event("storage"));
  };

  const trainerName = `${trainer.firstName || ""} ${trainer.lastName || ""}`.trim() || trainer.name || "Trainer";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0f172a] shadow-xl transition-all hover:-translate-y-1 hover:border-[#00ff87]/40 hover:shadow-[#00ff87]/5">
      {/* Top Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#00ff87] via-teal-400 to-cyan-400" />

      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#00ff87]/5 blur-3xl transition-colors group-hover:bg-[#00ff87]/10" />

      <div className="p-6">
        {/* Trainer Info */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00ff87] to-teal-500 text-xl font-black text-[#0a0f1e]">
            {trainerName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{trainerName}</h2>
            <p className="text-sm font-semibold text-[#00ff87]">
              {trainer.specialty || "Certified Coach"}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">4.9</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm leading-relaxed text-slate-300 line-clamp-2">
          {trainer.bio || "Expert fitness coach ready to help you achieve your peak physical potential."}
        </p>

        {/* Session Options */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Book a Session
          </h4>
          {SESSION_TYPES.map((session) => {
            const price = Math.round((trainer.hourlyRate || 500) * session.multiplier);
            const isAdded = addedSessions.includes(session.name);

            return (
              <div
                key={session.name}
                className="flex items-center justify-between rounded-xl border border-[#1e293b] bg-[#111827] px-4 py-3 transition hover:border-[#1e293b]/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e293b]">
                    {session.name === "Single Session" ? (
                      <Clock size={14} className="text-slate-400" />
                    ) : (
                      <Dumbbell size={14} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{session.name}</p>
                    <p className="text-xs text-slate-500">{session.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">Rs. {price.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(session)}
                    disabled={isAdded}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      isAdded
                        ? "bg-[#00ff87]/20 text-[#00ff87]"
                        : "bg-[#00ff87] text-[#0a0f1e] hover:bg-[#00cc6a] active:scale-90"
                    }`}
                  >
                    {isAdded ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-[#1e293b] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Starting from</p>
            <span className="text-xl font-black text-white">
              Rs. {(trainer.hourlyRate || 500).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500"> /session</span>
          </div>
          <SubscribeButton trainerId={trainer._id} amount={trainer.hourlyRate || 500} />
        </div>
      </div>
    </div>
  );
}
