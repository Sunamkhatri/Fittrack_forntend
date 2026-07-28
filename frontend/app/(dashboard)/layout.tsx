import Sidebar from "./_components/Sidebar";
import { getAuthToken } from "@/app/lib/cookies/token";
import { getProfile } from "@/app/lib/api/auth.api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAuthToken();
  let isAdmin = false;
  let isTrainer = false;
  let user = null;
  
  if (token) {
    const profile = await getProfile(token);
    user = profile.data?.user;
    
    if (profile.success && user?.role === "admin") {
      isAdmin = true;
    }
    if (profile.success && profile.data?.user?.role === "trainer") {
      isTrainer = true;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f1e] flex-col lg:flex-row">
      <Sidebar isAdmin={isAdmin} isTrainer={isTrainer} user={user} />
      <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
