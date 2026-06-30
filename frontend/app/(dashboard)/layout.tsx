import LogoutButton from "./_components/LogoutButton";
import Link from "next/link";
import { getAuthToken } from "@/app/lib/cookies/token";
import { getProfile } from "@/app/lib/api/auth.api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthToken();
  let isAdmin = false;
  
  if (token) {
    const profile = await getProfile(token);
    if (profile.success && profile.data?.user?.role === "admin") {
      isAdmin = true;
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <header className="border-b border-[#1e293b] bg-[#111827]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold text-[#00ff87]">
              FitTrack
            </Link>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Admin Panel
              </Link>
            )}
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
