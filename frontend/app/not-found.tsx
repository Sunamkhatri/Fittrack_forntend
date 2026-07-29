import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
      <div className="max-w-md rounded-2xl border border-[#1e293b] bg-[#111827] p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#00ff87]/10">
          <Compass className="text-[#00ff87]" size={28} />
        </div>

        <p className="text-5xl font-bold text-[#00ff87]">404</p>
        <h1 className="mt-3 text-xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          That page doesn&apos;t exist. It may have been moved or the link may
          be out of date.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-[#00ff87] px-5 py-2.5 text-sm font-bold text-[#0a0f1e] transition hover:bg-[#00cc6a]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
