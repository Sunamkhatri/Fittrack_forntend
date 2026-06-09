const API_BASE = "http://localhost:8080/api/v1/auth";

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
}

export async function registerUser(data: RegisterPayload) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<{ user: AuthUser; token: string }> =
    await response.json();

  return { ok: response.ok, ...result };
}

export async function loginUser(data: LoginPayload) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<{ user: AuthUser; token: string }> =
    await response.json();

  return { ok: response.ok, ...result };
}

export async function getProfile(token: string) {
  const response = await fetch(`${API_BASE}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result: ApiResponse<{ user: AuthUser }> = await response.json();

  return { ok: response.ok, ...result };
}
