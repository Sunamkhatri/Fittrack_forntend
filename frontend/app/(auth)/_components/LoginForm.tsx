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

  const inputClass =
    "w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#00ff87] focus:ring-1 focus:ring-[#00ff87]/30";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {apiError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-slate-400">
          Email
        </label>
        <input
          {...register("email")}
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-400">
            Password
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-[#00ff87] hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          {...register("password")}
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#00ff87] py-3 text-sm font-bold text-[#0a0f1e] transition hover:bg-[#00cc6a] hover:shadow-lg hover:shadow-[#00ff87]/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-[#00ff87] hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
