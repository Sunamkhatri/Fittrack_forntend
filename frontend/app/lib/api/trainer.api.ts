import type { AuthUser } from "./auth.api";
import { request, authConfig } from "./axios-instance";
import { API } from "./endpoints";

export async function getTrainers(token: string) {
  return request<{ trainers: AuthUser[] }>(
    { method: "GET", url: API.USERS.TRAINERS, ...authConfig(token) },
    "Failed to load trainers"
  );
}

export async function getClients(token: string) {
  return request<{ clients: AuthUser[] }>(
    { method: "GET", url: API.USERS.CLIENTS, ...authConfig(token) },
    "Failed to load clients"
  );
}

export async function initiatePayment(
  token: string,
  trainerId: string,
  amount: number
) {
  return request<{ payment_url: string; pidx: string }>(
    {
      method: "POST",
      url: API.PAYMENTS.INITIATE,
      data: { trainerId, amount },
      ...authConfig(token),
    },
    "Failed to initiate payment"
  );
}
