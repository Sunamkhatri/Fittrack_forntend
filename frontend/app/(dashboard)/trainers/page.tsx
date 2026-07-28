import { getAuthToken } from "@/app/lib/cookies/token";
import { getTrainers } from "@/app/lib/api/trainer.api";
import { redirect } from "next/navigation";
import TrainerCard from "./_components/TrainerCard";
import BookingCart from "./_components/BookingCart";

export default async function TrainersPage() {
  const token = await getAuthToken();
  if (!token) redirect("/login");

  const response = await getTrainers(token);
  const trainers = response.data?.trainers || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pro Trainers
          </h1>
          <p className="mt-2 text-slate-400">
            Elevate your fitness journey — browse coaches, book sessions, and pay securely with Khalti.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {trainers.map((trainer: any) => (
          <TrainerCard key={trainer._id} trainer={trainer} />
        ))}

        {trainers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1e293b] py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e293b] text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">No Trainers Available</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Run the seed script to populate trainers: <code className="rounded bg-[#1e293b] px-2 py-1 text-xs text-[#00ff87]">npx tsx seed-trainers.ts</code>
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart */}
      <BookingCart />
    </div>
  );
}
