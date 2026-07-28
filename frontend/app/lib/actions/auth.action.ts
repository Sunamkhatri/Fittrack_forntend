"use server";

import { redirect } from "next/navigation";
import { registerUser, loginUser, forgotPassword, resetPassword } from "../api/auth.api";
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

export async function handleForgotPassword(email: string) {
  const result = await forgotPassword(email);

  if (!result.ok || !result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, message: result.message };
}

export async function handleResetPassword(token: string, password: string) {
  const result = await resetPassword(token, password);

  if (!result.ok || !result.success) {
    return { success: false, message: result.message };
  }

  return { success: true, message: result.message };
}
