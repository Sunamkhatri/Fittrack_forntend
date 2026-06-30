"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterFormData } from "./schema";
import { handleRegister } from "@/app/lib/actions/auth.action";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" },
  });

  const onSubmit = (data: RegisterFormData) => {
    setApiError("");
    const { confirmPassword: _, ...payload } = data;

    startTransition(async () => {
      const result = await handleRegister(payload);

      if (!result.success) {
        setApiError(result.message);
        return;
      }

      router.push("/login");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">First Name</label>
          <input
            {...register("firstName")}
            className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm outline-none focus:border-[#00ff87]"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Last Name</label>
          <input
            {...register("lastName")}
            className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm outline-none focus:border-[#00ff87]"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm outline-none focus:border-[#00ff87]"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Username</label>
        <input
          {...register("username")}
          className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm outline-none focus:border-[#00ff87]"
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Password</label>
        <input
          {...register("password")}
          type="password"
          className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm outline-none focus:border-[#00ff87]"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Confirm Password</label>
        <input
          {...register("confirmPassword")}
          type="password"
          className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm outline-none focus:border-[#00ff87]"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Role</label>
        <select
          {...register("role")}
          className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2 text-sm outline-none focus:border-[#00ff87] text-white"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#00ff87] py-2.5 text-sm font-semibold text-[#0a0f1e] transition hover:bg-[#00cc6a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Register"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="text-[#00ff87] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
