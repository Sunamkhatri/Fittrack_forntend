import { redirect } from "next/navigation";
import { getAuthToken } from "@/app/lib/cookies/token";
import { getProfile } from "@/app/lib/api/auth.api";
import WelcomeBanner from "../_components/WelcomeBanner";
import StatsCard from "../_components/StatsCard";
import WeeklyCharts from "./_components/WeeklyCharts";
import QuickActions from "./_components/QuickActions";
import RecentActivity from "./_components/RecentActivity";

export default async function DashboardPage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const profile = await getProfile(token);

  if (!profile.ok || !profile.success || !profile.data) {
    redirect("/login");
  }

  const user = profile.data.user;
  const username = user.firstName ? `${user.firstName} ${user.lastName}` : user.username;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <WelcomeBanner username={username} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Calories Burned" value="520" unit="kcal" />
        <StatsCard label="Calories Consumed" value="2,100" unit="kcal" />
        <StatsCard label="Water Intake" value="2.5" unit="L" />
        <StatsCard label="Workout Minutes" value="45" unit="min" />
        <StatsCard label="Steps" value="8,432" />
        <StatsCard label="Current Weight" value={user.weight?.toString() || "75"} unit="kg" />
      </div>

      <WeeklyCharts />
      
      <QuickActions />

      <RecentActivity />
    </div>
  );
}
