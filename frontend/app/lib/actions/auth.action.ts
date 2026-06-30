"use server";

import { redirect } from "next/navigation";
import { registerUser, loginUser } from "../api/auth.api";
import { setAuthToken, clearAuthToken } from "../cookies/token";
import type { RegisterPayload, LoginPayload } from "../api/auth.api";

export async function handleRegister(data: RegisterPayload) {
  const result = await registerUser(data);

  if (!result.ok || !result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, message: result.message };
}

export async function handleLogin(data: LoginPayload) {
  const result = await loginUser(data);

  if (!result.ok || !result.success || !result.data) {
    return { success: false, message: result.message };
  }

  await setAuthToken(result.data.token);

  return { success: true, message: result.message };
}

export async function handleLogout() {
  await clearAuthToken();
  redirect("/login");
}
