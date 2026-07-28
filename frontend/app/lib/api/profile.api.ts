import type { AuthUser } from "./auth.api";
import { API_V1 } from "./config";

const API_BASE = `${API_V1}/users`;

export async function updateProfile(token: string, data: Partial<AuthUser>) {
  const response = await fetch(`${API_BASE}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updatePassword(token: string, data: any) {
  const response = await fetch(`${API_BASE}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function uploadProfileImage(token: string, file: File) {
  const formData = new FormData();
  formData.append("profileImage", file);

  const response = await fetch(`${API_BASE}/profile-image`, {
    method: "POST", // Multer uses POST for creations, but my backend route is POST too
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
}

export async function deleteProfileImage(token: string) {
  const response = await fetch(`${API_BASE}/profile-image`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}
