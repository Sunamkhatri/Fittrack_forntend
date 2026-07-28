import { getAuthToken } from "@/app/lib/cookies/token";
import { fetchUsers } from "@/app/lib/api/admin.api";
import { redirect } from "next/navigation";
import AdminDashboardTabs from "./_components/AdminDashboardTabs";
import { ShieldCheck } from "lucide-react";

export default async function AdminPage() {
  const token = await getAuthToken();
  if (!token) redirect("/login");

  const usersRes = await fetchUsers(token, { limit: 500 });

  const users = usersRes.data || [];
  const trainers = users.filter((u: any) => u.role === "trainer");
  const regularUsers = users.filter((u: any) => u.role === "user");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#00ff87]" size={32} />
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Admin Hub
            </h1>
          </div>
          <p className="mt-2 text-slate-400">
            Manage your users and verify trainers.
          </p>
        </div>
      </div>

      <AdminDashboardTabs 
        users={regularUsers} 
        trainers={trainers} 
      />
    </div>
  );
}
