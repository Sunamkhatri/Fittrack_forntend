"use server";

import { cookies } from "next/headers";
import type { AuthUser } from "./api/auth";

const TOKEN_KEY = "fittrack_token";
const USER_KEY = "fittrack_user";

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEY)?.value ?? null;
}

export async function storeUserData(user: AuthUser) {
  const cookieStore = await cookies();
  cookieStore.set(USER_KEY, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getUserData(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_KEY)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEY);
  cookieStore.delete(USER_KEY);
}
