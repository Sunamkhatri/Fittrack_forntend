import { getAuthToken } from "@/app/lib/cookies/token";
import { fetchUsers } from "@/app/lib/api/admin.api";
import { redirect } from "next/navigation";
import UserTable from "./_components/UserTable";
import AdminHeader from "./_components/AdminHeader";

export default async function AdminUsersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }

  const searchParams = await props.searchParams;

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const result = await fetchUsers(token, { page, limit: 10, search });

  if (!result.success && result.message === "Unauthorized") {
    // Basic protection if token is somehow invalid or not an admin
    redirect("/dashboard");
  }

  const users = result.data || [];
  const meta = result.meta || { total: 0, totalPages: 1 };
  const total = meta.total;
  const totalPages = meta.totalPages;

  return (
    <div className="space-y-6">
      <AdminHeader />
      <div className="rounded-xl border border-[#1e293b] bg-[#111827] overflow-hidden">
        <UserTable users={users} />
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#1e293b] pt-4 px-2">
          <p className="text-sm text-slate-400">
            Showing <span className="font-medium text-white">{users.length}</span> of{" "}
            <span className="font-medium text-white">{total}</span> users
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ""}`}
                className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-1 text-sm text-white hover:bg-[#1e293b]"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ""}`}
                className="rounded-lg border border-[#1e293b] bg-[#0a0f1e] px-3 py-1 text-sm text-white hover:bg-[#1e293b]"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
