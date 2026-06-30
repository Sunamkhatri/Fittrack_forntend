import { redirect } from "next/navigation";
import { getAuthToken } from "@/app/lib/cookies/token";
import { getProfile } from "@/app/lib/api/auth.api";
import WelcomeBanner from "../_components/WelcomeBanner";
import StatsCard from "../_components/StatsCard";

export default async function DashboardPage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const profile = await getProfile(token);

  if (!profile.ok || !profile.success || !profile.data) {
    redirect("/login");
  }

  const username = profile.data.user.username;

  return (
    <div className="space-y-8">
      <WelcomeBanner username={username} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard label="Steps Today" value="8,432" />
        <StatsCard label="Calories Burned" value="520" unit="kcal" />
        <StatsCard label="Workouts This Week" value="4" />
      </div>
    </div>
  );
}
