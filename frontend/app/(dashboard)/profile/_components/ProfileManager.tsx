"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/app/contexts/AuthStore";
import type { AuthUser } from "@/app/lib/api/auth.api";
import {
  updateProfile,
  updatePassword,
  uploadProfileImage,
  deleteProfileImage,
} from "@/app/lib/api/profile.api";
import { API_ORIGIN } from "@/app/lib/api/config";
import { Camera, Trash2, User as UserIcon } from "lucide-react";

export default function ProfileManager({
  initialUser,
  token,
}: {
  initialUser: AuthUser;
  token: string;
}) {
  const { user, updateUser } = useAuthStore();
  const activeUser = user || initialUser;

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: activeUser.firstName,
    lastName: activeUser.lastName,
    age: activeUser.age || "",
    gender: activeUser.gender || "",
    weight: activeUser.weight || "",
    height: activeUser.height || "",
    goal: activeUser.goal || "",
    activityLevel: activeUser.activityLevel || "",
    caloriesGoal: activeUser.caloriesGoal || "",
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const res = await uploadProfileImage(token, file);
      if (res.success && res.data) {
        updateUser({ profileImage: res.data.user.profileImage });
        setMessage({ type: "success", text: "Profile image updated!" });
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Image upload failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setIsLoading(true);
      const res = await deleteProfileImage(token);
      if (res.success) {
        updateUser({ profileImage: null });
        setMessage({ type: "success", text: "Profile image removed." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove image." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await updateProfile(token, {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        caloriesGoal: Number(formData.caloriesGoal),
      });

      if (res.success && res.data) {
        updateUser(res.data.user);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Profile update failed." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setIsLoading(true);
      const res = await updatePassword(token, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: res.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Password change failed." });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left Column: Picture & Basic Info */}
      <div className="space-y-6">
        <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6 text-center">
          <div className="relative mx-auto mb-4 h-32 w-32">
            {activeUser.profileImage ? (
              <img
                src={`${API_ORIGIN}${activeUser.profileImage}`}
                alt="Profile"
                className="h-full w-full rounded-full object-cover border-4 border-[#1e293b]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#1e293b] bg-[#0a0f1e]">
                <UserIcon size={48} className="text-slate-500" />
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 rounded-full bg-[#00ff87] p-2 text-[#0a0f1e] hover:bg-[#00cc6a] transition"
            >
              <Camera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
          </div>

          <h2 className="text-xl font-bold text-white">
            {activeUser.firstName} {activeUser.lastName}
          </h2>
          <p className="text-sm text-slate-400">@{activeUser.username}</p>
          <div className="mt-4 flex justify-center gap-2">
            {activeUser.profileImage && (
              <button
                onClick={handleImageDelete}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
              >
                <Trash2 size={16} /> Remove Image
              </button>
            )}
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-lg p-4 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Right Column: Edit Forms */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
          <h3 className="mb-6 text-lg font-semibold text-white">Personal Information</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-firstName" className="mb-1 block text-sm text-slate-400">First Name</label>
                <input
                  id="prof-firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label htmlFor="prof-lastName" className="mb-1 block text-sm text-slate-400">Last Name</label>
                <input
                  id="prof-lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label htmlFor="prof-age" className="mb-1 block text-sm text-slate-400">Age</label>
                <input
                  id="prof-age"
                  type="number"
                  autoComplete="off"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label htmlFor="prof-gender" className="mb-1 block text-sm text-slate-400">Gender</label>
                <select
                  id="prof-gender"
                  autoComplete="sex"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="prof-weight" className="mb-1 block text-sm text-slate-400">Weight (kg)</label>
                <input
                  id="prof-weight"
                  type="number"
                  autoComplete="off"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label htmlFor="prof-height" className="mb-1 block text-sm text-slate-400">Height (cm)</label>
                <input
                  id="prof-height"
                  type="number"
                  autoComplete="off"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label htmlFor="prof-goal" className="mb-1 block text-sm text-slate-400">Fitness Goal</label>
                <input
                  id="prof-goal"
                  autoComplete="off"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                />
              </div>
              <div>
                <label htmlFor="prof-activityLevel" className="mb-1 block text-sm text-slate-400">Activity Level</label>
                <select
                  id="prof-activityLevel"
                  autoComplete="off"
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly active">Lightly Active</option>
                  <option value="moderately active">Moderately Active</option>
                  <option value="very active">Very Active</option>
                  <option value="extra active">Extra Active</option>
                </select>
              </div>
            </div>
            <div className="pt-4 text-right">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-[#00ff87] px-6 py-2 text-sm font-semibold text-[#0a0f1e] transition hover:bg-[#00cc6a] disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-[#1e293b] bg-[#111827] p-6">
          <h3 className="mb-6 text-lg font-semibold text-white">Change Password</h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label htmlFor="prof-currentPassword" className="mb-1 block text-sm text-slate-400">Current Password</label>
              <input
                id="prof-currentPassword"
                type="password"
                autoComplete="current-password"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-newPassword" className="mb-1 block text-sm text-slate-400">New Password</label>
                <input
                  id="prof-newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                  required
                />
              </div>
              <div>
                <label htmlFor="prof-confirmPassword" className="mb-1 block text-sm text-slate-400">Confirm Password</label>
                <input
                  id="prof-confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm text-white outline-none focus:border-[#00ff87]"
                  required
                />
              </div>
            </div>
            <div className="pt-4 text-right">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-white px-6 py-2 text-sm font-semibold text-[#0a0f1e] transition hover:bg-slate-200 disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
