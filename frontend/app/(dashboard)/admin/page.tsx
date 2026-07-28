import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAuthToken } from "@/app/lib/cookies/token";
import { handleFetchUsers } from "@/app/lib/actions/admin.action";
import UserTable from "./_components/UserTable";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const token = await getAuthToken();
  if (!token) redirect("/login");

  const query = await searchParams;
  const parsedPage = parseInt(query.page as string, 10);
  const parsedLimit = parseInt(query.limit as string, 10);
  const search = query.search ? (query.search as string) : "";

  const { success, message, users, meta } = await handleFetchUsers({
    page: Number.isNaN(parsedPage) ? 1 : parsedPage,
    limit: Number.isNaN(parsedLimit) ? 10 : parsedLimit,
    search,
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[#00ff87]" size={32} />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Admin Hub
          </h1>
        </div>
        <p className="mt-2 text-slate-400">
          Search, page through and manage every registered account.
        </p>
      </div>

      {!success ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          {message || "Failed to load users."}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-2xl">
          <UserTable users={users} meta={meta} search={search} />
        </div>
      )}
    </div>
  );
}
