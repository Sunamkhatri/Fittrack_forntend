"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

// Without this, a throw in any dashboard server component falls through to the
// framework's default error screen and the user loses the sidebar entirely.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-[#1e293b] bg-[#111827] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="text-red-400" size={24} />
        </div>

        <h2 className="text-xl font-bold text-white">Something went wrong</h2>

        {/* The raw message can carry internal detail, so it is not rendered. */}
        <p className="mt-2 text-sm text-slate-400">
          This page could not be loaded. The server may be unreachable — check
          that the API is running and try again.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-slate-600">
            Reference: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#00ff87] px-5 py-2.5 text-sm font-bold text-[#0a0f1e] transition hover:bg-[#00cc6a]"
        >
          <RotateCw size={16} />
          Try again
        </button>
      </div>
    </div>
  );
}
