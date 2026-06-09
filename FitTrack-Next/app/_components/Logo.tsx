import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="text-xl font-bold tracking-wide text-accent-primary"
    >
      FitTrack
    </Link>
  );
}
