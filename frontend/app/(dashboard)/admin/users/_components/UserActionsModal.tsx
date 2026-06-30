"use client";

import { useState, useTransition, useEffect } from "react";
import type { AuthUser } from "@/app/lib/api/auth.api";
import { handleCreateUser, handleUpdateUser, handleDeleteUser } from "@/app/lib/actions/admin.action";

interface UserActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "delete" | null;
  user?: AuthUser | null;
}

export default function UserActionsModal({ isOpen, onClose, mode, user }: UserActionsModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    role: "user",
    password: "",
  });

  useEffect(() => {
    if (isOpen && user && mode === "edit") {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        password: "", // Password left blank for edits unless they want to change it
      });
    } else if (isOpen && mode === "create") {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        role: "user",
        password: "",
      });
    }
    setError("");
  }, [isOpen, user, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      if (mode === "create") {
        const result = await handleCreateUser(formData);
        if (!result.success) {
          setError(result.message);
        } else {
          onClose();
        }
      } else if (mode === "edit" && user) {
        // If password is blank during edit, remove it from payload
        const { password, ...rest } = formData;
        const payload = password.trim() === "" ? rest : formData;
        
        const result = await handleUpdateUser(user._id, payload);
        if (!result.success) {
          setError(result.message);
        } else {
          onClose();
        }
      } else if (mode === "delete" && user) {
        const result = await handleDeleteUser(user._id);
        if (!result.success) {
          setError(result.message);
        } else {
          onClose();
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#1e293b] bg-[#0a0f1e] p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-white">
          {mode === "create" && "Create New User"}
          {mode === "edit" && "Edit User"}
          {mode === "delete" && "Delete User"}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/30">
            {error}
          </div>
        )}

        {mode === "delete" ? (
          <div>
            <p className="text-slate-300">
              Are you sure you want to delete <span className="font-bold text-white">{user?.username}</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-[#1e293b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e293b] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">First Name</label>
                <input
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Last Name</label>
                <input
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">Email</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Username</label>
                <input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Password {mode === "edit" && <span className="text-xs text-slate-500">(Leave blank to keep current)</span>}
              </label>
              <input
                required={mode === "create"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-[#1e293b] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-[#1e293b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e293b] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-[#00ff87] px-4 py-2 text-sm font-semibold text-[#0a0f1e] hover:bg-[#00cc6a] disabled:opacity-50 transition"
              >
                {isPending ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
