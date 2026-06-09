"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/lib/actions/auth-action";
import { loginSchema, type LoginFormValues } from "./schema";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(values);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.push("/dashboard");
    });
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-on-dark mb-2">Welcome back</h1>
      <p className="text-muted mb-8">Sign in to continue your fitness journey</p>

      {error && (
        <div className="mb-6 rounded-lg border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm text-body mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-on-dark outline-none focus:border-accent-primary"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-accent-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-body mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-on-dark outline-none focus:border-accent-primary"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-accent-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-accent-primary py-2.5 font-semibold text-canvas transition hover:bg-accent-secondary disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
