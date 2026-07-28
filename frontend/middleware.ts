import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_NAME = "fittrack_token";
const ROLE_NAME = "fittrack_role";

const PUBLIC_AUTH_PATHS = ["/login", "/register", "/forgot-password"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/profile",
  "/progress",
  "/workouts",
  "/nutrition",
  "/settings",
  "/trainers",
  "/clients",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isPublicAuthPath = PUBLIC_AUTH_PATHS.includes(pathname);
  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // Unauthenticated visitors are bounced to login, remembering where they were
  // headed so the app can send them back after signing in.
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already signed in? The auth pages are pointless — send them to their home.
  if (isPublicAuthPath && token) {
    const role = request.cookies.get(ROLE_NAME)?.value;
    const target = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Non-admins have no business rendering the admin shell. This is UX only —
  // the API enforces the real check and returns 403 regardless of this cookie,
  // which the client can freely edit.
  if (pathname.startsWith("/admin") && token) {
    const role = request.cookies.get(ROLE_NAME)?.value;
    if (role && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/progress/:path*",
    "/workouts/:path*",
    "/nutrition/:path*",
    "/settings/:path*",
    "/trainers/:path*",
    "/clients/:path*",
  ],
};
