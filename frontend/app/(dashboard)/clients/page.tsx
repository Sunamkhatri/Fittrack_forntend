import { getAuthToken } from "@/app/lib/cookies/token";
import { getClients } from "@/app/lib/api/trainer.api";
import { getProfile } from "@/app/lib/api/auth.api";
import { redirect } from "next/navigation";

export default async function ClientsPage() {
  const token = await getAuthToken();
  if (!token) redirect("/login");

  // Verify Trainer Status
  const profile = await getProfile(token);
  if (profile.data?.user?.role !== "trainer") {
    redirect("/dashboard");
  }

  const response = await getClients(token);
  const clients = response.data?.clients || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Subscribers
          </h1>
          <p className="mt-2 text-slate-400">
            Monitor and manage your active Khalti subscribers.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#00ff87]/10 px-4 py-2 text-[#00ff87]">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff87] opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00ff87]"></span>
          </span>
          <span className="text-sm font-semibold">{clients.length} Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client: any) => (
          <div 
            key={client._id} 
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e293b] text-xl font-bold text-[#00ff87]">
                {client.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{client.name}</h2>
                <p className="text-sm font-medium text-slate-400">
                  {client.email}
                </p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#1e293b] pt-4">
               <div>
                  <p className="text-xs text-slate-500">Weight</p>
                  <p className="text-sm font-semibold text-white">{client.weight || "--"} kg</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500">Age</p>
                  <p className="text-sm font-semibold text-white">{client.age || "--"} yrs</p>
               </div>
               <div>
                  <p className="text-xs text-slate-500">Gender</p>
                  <p className="text-sm font-semibold capitalize text-white">{client.gender || "--"}</p>
               </div>
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-[#1e293b] py-20 text-center">
            <h3 className="mt-4 text-lg font-bold text-white">No Subscribers Yet</h3>
            <p className="mt-2 text-sm text-slate-400">
              You don't have any active clients yet. Keep growing your brand!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
