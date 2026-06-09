export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1e293b] bg-[#111827] p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
