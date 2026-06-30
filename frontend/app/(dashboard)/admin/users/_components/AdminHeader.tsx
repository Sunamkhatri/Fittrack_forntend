"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UserActionsModal from "./UserActionsModal";

export default function AdminHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search) {
      router.push(`/admin/users?search=${encodeURIComponent(search)}`);
    } else {
      router.push("/admin/users");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          <p className="text-sm text-slate-400">View, edit, and manage all user accounts.</p>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-l-lg border border-[#1e293b] bg-[#111827] px-4 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
            />
            <button
              type="submit"
              className="rounded-r-lg bg-[#1e293b] px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition"
            >
              Search
            </button>
          </form>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-lg bg-[#00ff87] px-4 py-2 text-sm font-semibold text-[#0a0f1e] hover:bg-[#00cc6a] transition"
          >
            + Add User
          </button>
        </div>
      </div>

      <UserActionsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />
    </>
  );
}
