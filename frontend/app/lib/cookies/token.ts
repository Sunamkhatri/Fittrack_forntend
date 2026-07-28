import { cookies } from "next/headers";

export const TOKEN_NAME = "fittrack_token";

// Mirrors the role claim already inside the JWT. It exists only so the Edge
// middleware can pick a redirect target without verifying a token — Edge has no
// node crypto. This is NOT a security boundary: it is readable and editable by
// the client, and the API independently enforces the real role check (403).
export const ROLE_NAME = "fittrack_role";

const MAX_AGE = 7 * 24 * 60 * 60;

export async function setAuthToken(token: string, role?: string) {
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: MAX_AGE,
    path: "/",
  });

  if (role) {
    cookieStore.set(ROLE_NAME, role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });
  }
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_NAME)?.value ?? null;
}

export async function getAuthRole() {
  const cookieStore = await cookies();
  return cookieStore.get(ROLE_NAME)?.value ?? null;
}

export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
  cookieStore.delete(ROLE_NAME);
}
