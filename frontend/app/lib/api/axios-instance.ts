import axios, { AxiosRequestConfig } from "axios";
import { API_V1 } from "./config";

// Shared client for every FitTrack API call. Paths come from endpoints.ts and
// are resolved against this baseURL.
const axiosInstance = axios.create({
  baseURL: API_V1,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// The auth token lives in an httpOnly cookie, so it is unreadable from client
// JS and cannot be attached by a request interceptor. Server actions read it
// via getAuthToken() and pass it down, which is why callers hand it in here.
export const authConfig = (token: string): AxiosRequestConfig => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const multipartConfig = (token: string): AxiosRequestConfig => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
});

export interface ApiResult<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: unknown;
}

/**
 * Runs a request and always resolves to a consistent shape.
 *
 * The API wraps responses as { status, success, message, data }, but the admin
 * list route returns a bare { data, meta }. Both are normalized here so callers
 * never have to branch on which endpoint they hit, and network failures come
 * back as an ordinary failed result rather than a thrown error.
 */
export async function request<T = unknown>(
  config: AxiosRequestConfig,
  fallbackMessage = "Request failed"
): Promise<ApiResult<T>> {
  try {
    const response = await axiosInstance.request(config);
    const body = response.data;

    return {
      success: body?.success ?? true,
      message: body?.message ?? "",
      data: (body?.data ?? body) as T,
      meta: body?.meta,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || fallbackMessage,
        data: null,
      };
    }
    return { success: false, message: fallbackMessage, data: null };
  }
}

export default axiosInstance;
