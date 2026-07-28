"use server";

import { initiatePayment } from "../api/trainer.api";
import { getAuthToken } from "../cookies/token";

export async function handleKhaltiPayment(trainerId: string, amount: number) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Unauthorized: Please log in." };

  const res = await initiatePayment(token, trainerId, amount);
  return res;
}
