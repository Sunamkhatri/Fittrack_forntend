import { redirect } from "next/navigation";
import { getAuthToken } from "@/app/lib/cookies/token";
import { getProfile } from "@/app/lib/api/auth.api";
import ProfileManager from "./_components/ProfileManager";

export default async function ProfilePage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/login");
  }

  const profile = await getProfile(token);

  if (!profile.ok || !profile.success || !profile.data) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile & Settings</h1>
        <p className="mt-2 text-slate-400">
          Manage your personal details, physical attributes, and account security.
        </p>
      </div>

      <ProfileManager initialUser={profile.data.user} token={token} />
    </div>
  );
}
