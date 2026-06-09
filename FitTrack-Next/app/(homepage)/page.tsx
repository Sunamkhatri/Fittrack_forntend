import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center">
        <Image
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80"
          alt="Athlete training"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/90 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-on-dark md:text-6xl">
            Track every rep.
            <br />
            <span className="text-accent-primary">Own every goal.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-body">
            FitTrack helps you log workouts, monitor nutrition, and measure
            progress — all in one powerful fitness platform.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-accent-primary px-6 py-3 font-semibold text-canvas transition hover:bg-accent-secondary"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-hairline px-6 py-3 font-semibold text-on-dark transition hover:border-accent-primary hover:text-accent-primary"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-surface-card py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-on-dark">
            Everything you need to stay on track
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Workout Logging",
                desc: "Record sets, reps, and weights with ease.",
              },
              {
                title: "Nutrition Tracking",
                desc: "Monitor macros and calories to fuel your goals.",
              },
              {
                title: "Progress Analytics",
                desc: "Visualize streaks, PRs, and body metrics over time.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-hairline bg-canvas p-6"
              >
                <h3 className="text-lg font-semibold text-accent-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-body">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
