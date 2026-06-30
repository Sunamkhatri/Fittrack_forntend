"use server";

import { revalidatePath } from "next/cache";
import { fetchUsers, createUser, updateUser, deleteUser } from "../api/admin.api";
import { getAuthToken } from "../cookies/token";
import type { GetUsersParams } from "../api/admin.api";
import { AuthUser } from "../api/auth.api";

export async function handleFetchUsers(params: GetUsersParams = {}) {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Unauthorized", data: null };
  }
  return await fetchUsers(token, params);
}

export async function handleCreateUser(data: Partial<AuthUser> & { password?: string }) {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Unauthorized" };
  }
  const result = await createUser(token, data);
  if (result.success) {
    revalidatePath("/admin/users");
  }
  return result;
}

export async function handleUpdateUser(id: string, data: Partial<AuthUser> & { password?: string }) {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Unauthorized" };
  }
  const result = await updateUser(token, id, data);
  if (result.success) {
    revalidatePath("/admin/users");
  }
  return result;
}

export async function handleDeleteUser(id: string) {
  const token = await getAuthToken();
  if (!token) {
    return { success: false, message: "Unauthorized" };
  }
  const result = await deleteUser(token, id);
  if (result.success) {
    revalidatePath("/admin/users");
  }
  return result;
}
