import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center">
        <Logo />
        <p className="text-sm text-muted">
          Track every rep. Own every goal.
        </p>
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} FitTrack. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
