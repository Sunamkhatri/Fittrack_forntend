"use server";

import { initiatePayment } from "../api/trainer.api";
import { getAuthToken } from "../cookies/token";

export async function handleKhaltiPayment(trainerId: string, amount: number) {
  const token = await getAuthToken();
  if (!token) {
    // Same shape as a failed request so callers never branch on which
    // failure they got.
    return { success: false, message: "Unauthorized: Please log in.", data: null };
  }

  return initiatePayment(token, trainerId, amount);
}
