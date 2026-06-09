import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-body transition hover:text-on-dark"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-accent-primary px-4 py-2 text-sm font-medium text-accent-primary transition hover:bg-accent-primary hover:text-canvas"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
