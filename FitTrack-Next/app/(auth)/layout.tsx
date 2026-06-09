import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
          alt="Fitness gym"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="text-3xl font-bold text-on-dark tracking-wide">
            FitTrack
          </p>
          <p className="mt-2 text-lg text-body">
            Track every rep. Own every goal.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 bg-canvas">
        <div className="w-full max-w-md rounded-2xl border border-hairline bg-surface-card p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
