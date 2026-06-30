"use client";

import { useState } from "react";
import type { AuthUser } from "@/app/lib/api/auth.api";
import UserActionsModal from "./UserActionsModal";

export default function UserTable({ users }: { users: AuthUser[] }) {
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [modalMode, setModalMode] = useState<"edit" | "delete" | null>(null);

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        No users found. Try adjusting your search query.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1e293b] text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status / Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-[#1e293b] hover:bg-[#1e293b]/50 transition"
              >
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {user._id.slice(-6)}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    Active
                  </span>
                  {user.createdAt && (
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setModalMode("edit");
                    }}
                    className="mr-3 text-[#00ff87] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setModalMode("delete");
                    }}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserActionsModal
        isOpen={modalMode !== null}
        onClose={() => {
          setModalMode(null);
          setSelectedUser(null);
        }}
        mode={modalMode}
        user={selectedUser}
      />
    </>
  );
}
