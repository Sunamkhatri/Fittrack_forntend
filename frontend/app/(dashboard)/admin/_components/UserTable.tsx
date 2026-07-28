"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import DeleteModal from "@/app/_components/DeleteModal";
import { handleDeleteUser } from "@/app/lib/actions/admin.action";
import type { AuthUser } from "@/app/lib/api/auth.api";
import type { PaginationMeta } from "@/app/lib/api/admin.api";

interface UserTableProps {
  users: AuthUser[];
  meta: PaginationMeta | null;
  search: string;
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-amber-500/10 text-amber-400",
  trainer: "bg-[#00ff87]/10 text-[#00ff87]",
  user: "bg-slate-800/80 text-slate-300",
};

export default function UserTable({ users, meta, search }: UserTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(search);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const limit = meta?.limit ?? 10;

  // Builds a URL that preserves the filters not being changed, so paging
  // no longer drops the active search and vice versa.
  const buildHref = (next: { page?: number; limit?: number; search?: string }) => {
    const params = new URLSearchParams();
    const page = next.page ?? meta?.page ?? 1;
    if (page > 1) params.set("page", String(page));
    params.set("limit", String(next.limit ?? limit));
    const term = next.search ?? search;
    if (term) params.set("search", term);
    return `/admin?${params.toString()}`;
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to page 1: the term may not have as many pages as the current one.
    router.push(buildHref({ search: searchTerm, page: 1 }));
  };

  const onConfirmDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await handleDeleteUser(deleteId);
      setFeedback(
        result.success
          ? { type: "success", text: "User deleted." }
          : { type: "error", text: result.message || "Failed to delete user." }
      );
      setDeleteId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <DeleteModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={onConfirmDelete}
        isBusy={isPending}
        title="Delete this user?"
        description="This permanently removes the account and cannot be undone."
      />

      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-[#00ff87]/30 bg-[#00ff87]/10 text-[#00ff87]"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={onSearch} className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or username…"
            className="w-full rounded-lg border border-[#1e293b] bg-[#111827] py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition focus:border-[#00ff87]/50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#00ff87] px-5 py-2 text-sm font-bold text-[#0a0f1e] transition hover:bg-[#00e078]"
        >
          Search
        </button>
        <select
          value={limit}
          onChange={(e) =>
            router.push(buildHref({ limit: Number(e.target.value), page: 1 }))
          }
          className="rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-slate-300 focus:border-[#00ff87]/50 focus:outline-none"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </form>

      <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#111827]">
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Name</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Email</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Role</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="transition hover:bg-white/5">
                  <td className="px-5 py-3 text-sm font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400">{user.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        ROLE_STYLES[user.role] ?? ROLE_STYLES.user
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteId(user._id)}
                      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                  {search ? `No users match “${search}”.` : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page <span className="font-semibold text-white">{meta.page}</span> of{" "}
            <span className="font-semibold text-white">{meta.totalPages}</span>
            <span className="mx-2 text-slate-600">•</span>
            {meta.total} total
          </p>
          <div className="flex gap-2">
            {meta.page > 1 && (
              <Link
                href={buildHref({ page: meta.page - 1 })}
                className="rounded-lg border border-[#1e293b] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Previous
              </Link>
            )}
            {meta.page < meta.totalPages && (
              <Link
                href={buildHref({ page: meta.page + 1 })}
                className="rounded-lg border border-[#1e293b] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
