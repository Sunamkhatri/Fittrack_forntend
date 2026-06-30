"use client";

import { useTransition } from "react";
import { handleLogout } from "@/app/lib/actions/auth.action";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => handleLogout())}
      disabled={isPending}
      className="rounded-lg border border-[#1e293b] px-4 py-2 text-sm text-slate-300 transition hover:border-[#00ff87] hover:text-[#00ff87] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
