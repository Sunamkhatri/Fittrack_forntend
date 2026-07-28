import { request, authConfig } from "./axios-instance";
import { API } from "./endpoints";

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

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export async function registerUser(data: RegisterPayload) {
  return request<AuthSession>(
    { method: "POST", url: API.AUTH.REGISTER, data },
    "Registration failed"
  );
}

export async function loginUser(data: LoginPayload) {
  return request<AuthSession>(
    { method: "POST", url: API.AUTH.LOGIN, data },
    "Login failed"
  );
}

export async function getProfile(token: string) {
  return request<{ user: AuthUser }>(
    { method: "GET", url: API.AUTH.ME, ...authConfig(token) },
    "Profile fetch failed"
  );
}

export async function forgotPassword(email: string) {
  return request(
    { method: "POST", url: API.AUTH.FORGOT_PASSWORD, data: { email } },
    "Failed to send reset email"
  );
}

export async function resetPassword(token: string, password: string) {
  return request(
    { method: "PUT", url: API.AUTH.RESET_PASSWORD(token), data: { password } },
    "Failed to reset password"
  );
}
