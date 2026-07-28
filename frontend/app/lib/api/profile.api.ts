import type { AuthUser } from "./auth.api";
import { request, authConfig, multipartConfig } from "./axios-instance";
import { API } from "./endpoints";

export async function updateProfile(token: string, data: Partial<AuthUser>) {
  return request<{ user: AuthUser }>(
    { method: "PUT", url: API.USERS.PROFILE, data, ...authConfig(token) },
    "Failed to update profile"
  );
}

export async function updatePassword(
  token: string,
  data: { currentPassword: string; newPassword: string }
) {
  return request(
    { method: "PUT", url: API.USERS.CHANGE_PASSWORD, data, ...authConfig(token) },
    "Failed to update password"
  );
}

export async function uploadProfileImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("profileImage", file);

  return request<{ user: AuthUser }>(
    {
      method: "POST",
      url: API.USERS.PROFILE_IMAGE,
      data: formData,
      ...multipartConfig(token),
    },
    "Failed to upload image"
  );
}

export async function deleteProfileImage(token: string) {
  return request<{ user: AuthUser }>(
    { method: "DELETE", url: API.USERS.PROFILE_IMAGE, ...authConfig(token) },
    "Failed to remove image"
  );
}
