import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookies";
import LogoutButton from "./_components/LogoutButton";

export default async function DashboardPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  const stats = [
    { label: "Workouts", value: "0", sub: "This week" },
    { label: "Streak", value: "0 days", sub: "Current streak" },
    { label: "Goals", value: user.fitnessGoal?.replace(/_/g, " ") ?? "Not set", sub: "Fitness goal" },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-wide text-accent-primary">
            FitTrack
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-on-dark">
          Welcome back, {user.firstName}!
        </h1>
        <p className="mt-2 text-body">
          @{user.username} &middot; {user.email}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-hairline bg-surface-card p-6"
            >
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold capitalize text-on-dark">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-hairline bg-surface-card p-6">
          <h2 className="text-lg font-semibold text-on-dark">Profile</h2>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted">Full name</dt>
              <dd className="text-on-dark">
                {user.firstName} {user.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="capitalize text-on-dark">{user.role}</dd>
            </div>
            {user.weightKg && (
              <div>
                <dt className="text-muted">Weight</dt>
                <dd className="text-on-dark">{user.weightKg} kg</dd>
              </div>
            )}
            {user.heightCm && (
              <div>
                <dt className="text-muted">Height</dt>
                <dd className="text-on-dark">{user.heightCm} cm</dd>
              </div>
            )}
          </dl>
        </div>
      </main>
    </div>
  );
}
