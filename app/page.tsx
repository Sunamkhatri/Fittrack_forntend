import Link from 'next/link';

export default function Home() {
  return (
    <main className="hero">
      <h1 className="logo">
        <span>Fit</span>Track
      </h1>

      <p className="subtitle">
        Track Your Fitness Journey
      </p>

      <div className="loader"></div>

      <Link href="/login" className="btn">
        Get Started
      </Link>
    </main>
  );
}