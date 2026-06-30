"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from "./schema";
import { handleLogin } from "@/app/lib/actions/auth.action";

export default function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setApiError("");

    startTransition(async () => {
      const result = await handleLogin(data);

      if (!result.success) {
        setApiError(result.message);
        return;
      }

      router.push("/dashboard");
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

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

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#00ff87] py-2.5 text-sm font-semibold text-[#0a0f1e] transition hover:bg-[#00cc6a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#00ff87] hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
