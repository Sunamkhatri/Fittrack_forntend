const API_BASE = "http://localhost:8089/api/v1/auth";

interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  goal?: string;
  activityLevel?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  goal?: string;
  activityLevel?: string;
  caloriesGoal?: number;
  profileImage?: string | null;
  createdAt?: string;
}

export async function registerUser(data: RegisterPayload) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return { ok: false, success: false, message: error.message || "Registration failed", data: null };
    }

    const result: ApiResponse<{ user: AuthUser; token: string }> =
      await response.json();

    return { ok: response.ok, ...result };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      ok: false,
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to server",
      data: null,
    };
  }
}

export async function loginUser(data: LoginPayload) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return { ok: false, success: false, message: error.message || "Login failed", data: null };
    }

    const result: ApiResponse<{ user: AuthUser; token: string }> =
      await response.json();

    return { ok: response.ok, ...result };
  } catch (error) {
    console.error("Login error:", error);
    return {
      ok: false,
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to server",
      data: null,
    };
  }
}

export async function getProfile(token: string) {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return { ok: false, success: false, message: error.message || "Profile fetch failed", data: null };
    }

    const result: ApiResponse<{ user: AuthUser }> = await response.json();

    return { ok: response.ok, ...result };
  } catch (error) {
    console.error("Profile fetch error:", error);
    return {
      ok: false,
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to server",
      data: null,
    };
  }
}

export async function forgotPassword(email: string) {
  try {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return { ok: false, success: false, message: error.message || "Failed to send reset email", data: null };
    }

    const result: ApiResponse<{}> = await response.json();
    return { ok: response.ok, ...result };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      ok: false,
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to server",
      data: null,
    };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    const response = await fetch(`${API_BASE}/reset-password/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      return { ok: false, success: false, message: error.message || "Failed to reset password", data: null };
    }

    const result: ApiResponse<{}> = await response.json();
    return { ok: response.ok, ...result };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      ok: false,
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to server",
      data: null,
    };
  }
}
