"use client";

import { useState } from "react";
import { handleKhaltiPayment } from "@/app/lib/actions/trainer.action";
import { Loader2 } from "lucide-react";

export default function SubscribeButton({ trainerId, amount }: { trainerId: string, amount: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    const res = await handleKhaltiPayment(trainerId, amount);
    if (res.success && res.data?.payment_url) {
      // Redirect to Khalti Sandbox e-Payment Gateway
      window.location.href = res.data.payment_url;
    } else {
      setError(res.message || "Failed to initiate transaction.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#00ff87] px-5 py-2.5 text-sm font-bold text-[#0a0f1e] shadow-lg shadow-[#00ff87]/20 transition-all hover:bg-[#00cc6a] hover:shadow-xl hover:shadow-[#00ff87]/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        {loading ? "Loading Gateway..." : "Subscribe"}
      </button>
      {error && <p className="mt-2 text-xs font-medium text-red-400">{error}</p>}
    </div>
  );
}
