import { AuthUser } from "./auth.api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users` : "http://localhost:8089/api/v1/admin/users";

interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedUsers {
  users: AuthUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function fetchUsers(token: string, params: GetUsersParams = {}) {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    if (params.role) query.append("role", params.role);
    if (params.status) query.append("status", params.status);

    const response = await fetch(`${API_BASE}?${query.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }));
      return { success: false, message: error.message || "Failed to fetch users", data: null, meta: null };
    }

    const result = await response.json();
    return { success: true, data: result.data, meta: result.meta };
  } catch (error) {
    console.error("fetchUsers error:", error);
    return { success: false, message: "Network error", data: null, meta: null };
  }
}

export async function createUser(token: string, data: Partial<AuthUser> & { password?: string }) {
  try {
    const response = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();
    return { success: response.ok, message: result.message || (response.ok ? "User created" : "Failed"), data: result.data };
  } catch (error) {
    console.error("createUser error:", error);
    return { success: false, message: "Network error", data: null };
  }
}

export async function updateUser(token: string, id: string, data: Partial<AuthUser> & { password?: string }) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const result = await response.json();
    return { success: response.ok, message: result.message || (response.ok ? "User updated" : "Failed"), data: result.data };
  } catch (error) {
    console.error("updateUser error:", error);
    return { success: false, message: "Network error", data: null };
  }
}

export async function deleteUser(token: string, id: string) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const result = await response.json();
    return { success: response.ok, message: result.message || (response.ok ? "User deleted" : "Failed") };
  } catch (error) {
    console.error("deleteUser error:", error);
    return { success: false, message: "Network error" };
  }
}

export async function fetchRevenue(token: string) {
  try {
    const revenueUrl = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/admin/revenue/all` : "http://localhost:8089/api/v1/admin/revenue/all";
    const response = await fetch(revenueUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    return { success: response.ok, data: result.data };
  } catch (error) {
    return { success: false, data: null };
  }
}
