const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8089/api/v1";

export async function getTrainers(token: string) {
  try {
    const res = await fetch(`${API_URL}/users/trainers`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}

export async function getClients(token: string) {
  try {
    const res = await fetch(`${API_URL}/users/clients`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}

export async function initiatePayment(token: string, trainerId: string, amount: number) {
  try {
    const res = await fetch(`${API_URL}/payments/initiate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trainerId, amount }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}
