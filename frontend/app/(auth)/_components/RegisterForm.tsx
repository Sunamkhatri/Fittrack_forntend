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

  const inputClass =
    "w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#00ff87] focus:ring-1 focus:ring-[#00ff87]/30";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {apiError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reg-firstName" className="mb-1 block text-sm font-medium text-slate-400">
            First Name
          </label>
          <input
            {...register("firstName")}
            id="reg-firstName"
            autoComplete="given-name"
            placeholder="John"
            className={inputClass}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="reg-lastName" className="mb-1 block text-sm font-medium text-slate-400">
            Last Name
          </label>
          <input
            {...register("lastName")}
            id="reg-lastName"
            autoComplete="family-name"
            placeholder="Doe"
            className={inputClass}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-slate-400">
          Email
        </label>
        <input
          {...register("email")}
          id="reg-email"
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
        <label htmlFor="reg-username" className="mb-1 block text-sm font-medium text-slate-400">
          Username
        </label>
        <input
          {...register("username")}
          id="reg-username"
          autoComplete="username"
          placeholder="john_doe"
          className={inputClass}
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-slate-400">
            Password
          </label>
          <input
            {...register("password")}
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="reg-confirmPassword" className="mb-1 block text-sm font-medium text-slate-400">
            Confirm Password
          </label>
          <input
            {...register("confirmPassword")}
            id="reg-confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="reg-role" className="mb-1 block text-sm font-medium text-slate-400">
          Role
        </label>
        <select
          {...register("role")}
          id="reg-role"
          autoComplete="off"
          className={inputClass}
        >
          <option value="user">User</option>
          <option value="trainer">Trainer</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-[#1e293b] pt-4">
        <div>
          <label htmlFor="reg-age" className="mb-1 block text-sm font-medium text-slate-400">
            Age
          </label>
          <input
            {...register("age", { valueAsNumber: true })}
            id="reg-age"
            type="number"
            autoComplete="off"
            placeholder="25"
            className={inputClass}
          />
          {errors.age && (
            <p className="mt-1 text-xs text-red-400">{errors.age.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="reg-gender" className="mb-1 block text-sm font-medium text-slate-400">
            Gender
          </label>
          <select
            {...register("gender")}
            id="reg-gender"
            autoComplete="sex"
            className={inputClass}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-xs text-red-400">{errors.gender.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="reg-weight" className="mb-1 block text-sm font-medium text-slate-400">
            Weight (kg)
          </label>
          <input
            {...register("weight", { valueAsNumber: true })}
            id="reg-weight"
            type="number"
            autoComplete="off"
            placeholder="70"
            className={inputClass}
          />
          {errors.weight && (
            <p className="mt-1 text-xs text-red-400">{errors.weight.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#00ff87] py-3 text-sm font-bold text-[#0a0f1e] transition hover:bg-[#00cc6a] hover:shadow-lg hover:shadow-[#00ff87]/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#00ff87] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
