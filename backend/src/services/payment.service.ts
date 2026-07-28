import axios from "axios";
import { PaymentModel } from "../models/payment.model.js";
import { UserModel } from "../models/user.model.js";
import { HttpException } from "../exceptions/http-exception.js";
import { KHALTI_SECRET_KEY, KHALTI_BASE_URL, FRONTEND_ORIGIN } from "../configs/constant.js";

function khaltiAuthHeaders() {
  if (!KHALTI_SECRET_KEY) {
    throw new HttpException(500, "KHALTI_SECRET_KEY is not configured");
  }
  return {
    Authorization: `Key ${KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export class PaymentService {
  async initiatePayment(userId: string, trainerId: string, amount: number) {
    // 1. Verify Trainer
    const trainer = await UserModel.findById(trainerId);
    if (!trainer || trainer.role !== "trainer") {
      throw new HttpException(404, "Trainer not found or invalid role");
    }

    // 2. Verify User
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new HttpException(404, "User not found");
    }

    // 3. Setup Khalti Payload
    const purchaseOrderId = `${userId}_${trainerId}_${Date.now()}`;
    const payload = {
      return_url: `${FRONTEND_ORIGIN}/dashboard/trainers/success`,
      website_url: FRONTEND_ORIGIN,
      amount: amount * 100, // Khalti requires amount in paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `FitTrack Trainer Subscription: ${trainer.firstName}`,
      customer_info: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: "9800000000",
      },
    };

    // 4. Hit Khalti API
    const response = await axios.post(`${KHALTI_BASE_URL}/epayment/initiate/`, payload, {
      headers: khaltiAuthHeaders(),
    });

    if (response.data && response.data.pidx) {
      // 5. Save Pending Ledger
      await PaymentModel.create({
        user: userId,
        trainer: trainerId,
        pidx: response.data.pidx,
        amount,
        status: "pending",
      });

      return {
        payment_url: response.data.payment_url,
        pidx: response.data.pidx,
      };
    } else {
      throw new HttpException(500, "Failed to initiate Khalti payment");
    }
  }

  async verifyPayment(pidx: string) {
    const payment = await PaymentModel.findOne({ pidx });
    if (!payment) {
      throw new HttpException(404, "Payment record not found");
    }

    if (payment.status === "completed") {
      return { status: "already_completed", payment };
    }

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      { headers: khaltiAuthHeaders() }
    );

    const status = response.data.status;
    if (status === "Completed") {
      // 1. Mark Payment Ledger as Completed
      payment.status = "completed";
      payment.transactionId = response.data.transaction_id;
      await payment.save();

      // 2. MAGIC: Subscribe user to trainer!
      await UserModel.findByIdAndUpdate(payment.trainer, {
        $addToSet: { clients: payment.user },
      });

      return { status: "completed", payment };
    } else {
      payment.status = "failed";
      await payment.save();
      throw new HttpException(400, "Payment verification failed or pending");
    }
  }
}
