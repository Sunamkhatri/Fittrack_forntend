"use server";

import { revalidatePath } from "next/cache";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/admin.api";
import { getAuthToken } from "../cookies/token";
import type {
  GetUsersParams,
  AdminUserPayload,
  PaginationMeta,
} from "../api/admin.api";
import type { AuthUser } from "../api/auth.api";

// The admin listing renders at /admin — there is no /admin/users route.
const ADMIN_PATH = "/admin";

const unauthorized = (message = "Unauthorized") => ({
  success: false as const,
  message,
  data: null,
});

export async function handleFetchUsers(params: GetUsersParams = {}) {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Unauthorized", users: [] as AuthUser[], meta: null };
  }

  const result = await fetchUsers(token, {
    page: params.page || 1,
    limit: params.limit || 10,
    search: params.search || "",
    ...(params.role ? { role: params.role } : {}),
    ...(params.status ? { status: params.status } : {}),
  });

  return {
    success: result.success,
    message: result.message,
    users: (result.data ?? []) as AuthUser[],
    meta: (result.meta ?? null) as PaginationMeta | null,
  };
}

export async function handleCreateUser(data: AdminUserPayload) {
  const token = await getAuthToken();
  if (!token) return unauthorized();

  const result = await createUser(token, data);
  if (result.success) revalidatePath(ADMIN_PATH);
  return result;
}

export async function handleUpdateUser(id: string, data: AdminUserPayload) {
  const token = await getAuthToken();
  if (!token) return unauthorized();

  const result = await updateUser(token, id, data);
  if (result.success) revalidatePath(ADMIN_PATH);
  return result;
}

export async function handleDeleteUser(id: string) {
  const token = await getAuthToken();
  if (!token) return unauthorized();

  const result = await deleteUser(token, id);
  if (result.success) revalidatePath(ADMIN_PATH);
  return result;
}
