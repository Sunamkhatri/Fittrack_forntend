"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "@/lib/actions/auth-action";
import { registerSchema, type RegisterFormValues } from "./schema";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: RegisterFormValues) => {
    setError(null);
    startTransition(async () => {
      const { confirmPassword: _, ...payload } = values;
      const result = await registerAction(payload);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.push("/dashboard");
    });
  };

  const inputClass =
    "w-full rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-on-dark outline-none focus:border-accent-primary";

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-on-dark mb-2">Create account</h1>
      <p className="text-muted mb-8">Start tracking your fitness goals today</p>

      {error && (
        <div className="mb-6 rounded-lg border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm text-body mb-1.5">
              First name
            </label>
            <input
              id="firstName"
              {...register("firstName")}
              className={inputClass}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-accent-danger">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm text-body mb-1.5">
              Last name
            </label>
            <input
              id="lastName"
              {...register("lastName")}
              className={inputClass}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-accent-danger">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-body mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={inputClass}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-accent-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="username" className="block text-sm text-body mb-1.5">
            Username
          </label>
          <input id="username" {...register("username")} className={inputClass} />
          {errors.username && (
            <p className="mt-1 text-sm text-accent-danger">
              {errors.username.message}
            </p>
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
            className={inputClass}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-accent-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm text-body mb-1.5">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-accent-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-accent-primary py-2.5 font-semibold text-canvas transition hover:bg-accent-secondary disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
