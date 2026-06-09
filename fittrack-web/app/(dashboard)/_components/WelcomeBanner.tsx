interface WelcomeBannerProps {
  username: string;
}

export default function WelcomeBanner({ username }: WelcomeBannerProps) {
  return (
    <div className="rounded-xl border border-[#1e293b] bg-gradient-to-r from-[#111827] to-[#0a0f1e] p-8">
      <h2 className="text-2xl font-bold text-white">
        Welcome back,{" "}
        <span className="text-[#00ff87]">{username}</span>
      </h2>
      <p className="mt-2 text-slate-400">
        Here&apos;s a snapshot of your fitness progress today.
      </p>
    </div>
  );
}
