"use client";

import { useState, useTransition, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { handleResetPassword } from "@/app/lib/actions/auth.action";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const { token } = use(params);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: "", text: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    startTransition(async () => {
      const result = await handleResetPassword(token, password);

      if (result.success) {
        setMessage({ type: "success", text: "Password has been successfully reset. Redirecting..." });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const inputClass =
    "w-full rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-2.5 pl-10 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#00ff87] focus:ring-1 focus:ring-[#00ff87]/30";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] p-4 font-sans text-white">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="group mb-8 flex w-fit items-center text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create New Password
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Your new password must be different from previous used passwords.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {message.text && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : "border-red-500/30 bg-red-500/10 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-400">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-400">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || message.type === "success"}
              className="w-full rounded-lg bg-[#00ff87] py-3 text-sm font-bold text-[#0a0f1e] transition hover:bg-[#00cc6a] hover:shadow-lg hover:shadow-[#00ff87]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
