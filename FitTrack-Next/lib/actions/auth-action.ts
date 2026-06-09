"use server";

import { loginUser, registerUser } from "../api/auth";
import {
  clearAuthCookies,
  setTokenCookie,
  storeUserData,
} from "../cookies";

export async function registerAction(payload: {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}) {
  try {
    const response = await registerUser(payload);

    if (!response.success || !response.data?.token) {
      return {
        success: false as const,
        message: response.message || "Registration failed",
      };
    }

    await setTokenCookie(response.data.token);
    await storeUserData(response.data.user);

    return { success: true as const, message: "Account created successfully" };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Registration failed. Please try again.";
    const axiosMessage =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: { message?: string } } }).response
        ?.data?.message === "string"
        ? (error as { response: { data: { message: string } } }).response.data
            .message
        : null;

    return { success: false as const, message: axiosMessage || message };
  }
}

export async function loginAction(payload: { email: string; password: string }) {
  try {
    const response = await loginUser(payload);

    if (!response.success || !response.data) {
      return { success: false as const, message: response.message };
    }

    await setTokenCookie(response.data.token);
    await storeUserData(response.data.user);

    return { success: true as const, message: "Login successful" };
  } catch (error: unknown) {
    const axiosMessage =
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: { message?: string } } }).response
        ?.data?.message === "string"
        ? (error as { response: { data: { message: string } } }).response.data
            .message
        : null;

    return {
      success: false as const,
      message: axiosMessage || "Login failed. Please check your credentials.",
    };
  }
}

export async function logoutAction() {
  await clearAuthCookies();
}
