import type { AuthUser } from "./auth.api";
import { request, authConfig } from "./axios-instance";
import { API } from "./endpoints";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export type AdminUserPayload = Partial<AuthUser> & { password?: string };

export async function fetchUsers(token: string, params: GetUsersParams = {}) {
  return request<AuthUser[]>(
    { method: "GET", url: API.ADMIN.USERS.GET, params, ...authConfig(token) },
    "Failed to fetch users"
  );
}

export async function fetchUser(token: string, id: string) {
  return request<AuthUser>(
    { method: "GET", url: API.ADMIN.USERS.GET_ONE(id), ...authConfig(token) },
    "Failed to fetch user"
  );
}

export async function createUser(token: string, data: AdminUserPayload) {
  return request<AuthUser>(
    { method: "POST", url: API.ADMIN.USERS.CREATE, data, ...authConfig(token) },
    "Failed to create user"
  );
}

export async function updateUser(
  token: string,
  id: string,
  data: AdminUserPayload
) {
  return request<AuthUser>(
    { method: "PUT", url: API.ADMIN.USERS.UPDATE(id), data, ...authConfig(token) },
    "Failed to update user"
  );
}

export async function deleteUser(token: string, id: string) {
  return request(
    { method: "DELETE", url: API.ADMIN.USERS.DELETE(id), ...authConfig(token) },
    "Failed to delete user"
  );
}

export async function fetchRevenue(token: string) {
  return request(
    { method: "GET", url: API.ADMIN.REVENUE, ...authConfig(token) },
    "Failed to fetch revenue"
  );
}
