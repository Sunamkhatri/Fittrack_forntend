import { axiosInstance } from "./axios-instance";
import { API } from "./endpoints";

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  weightKg?: number;
  heightCm?: number;
  fitnessGoal?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiEnvelope<T> {
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

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function registerUser(payload: RegisterPayload) {
  const { data } = await axiosInstance.post<ApiEnvelope<AuthResponse>>(
    API.AUTH.REGISTER,
    payload
  );
  return data;
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await axiosInstance.post<ApiEnvelope<AuthResponse>>(
    API.AUTH.LOGIN,
    payload
  );
  return data;
}
