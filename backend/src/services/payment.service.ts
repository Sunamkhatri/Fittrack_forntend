import axios from "axios";
import { PaymentModel } from "../models/payment.model.js";
import { UserModel } from "../models/user.model.js";
import { HttpException } from "../exceptions/http-exception.js";

const KHALTI_LIVE_SECRET_KEY = process.env.KHALTI_LIVE_SECRET_KEY || "live_secret_key_68791341fdd94846a146f0457ff7b455";
const KHALTI_API_URL = "https://a.khalti.com/api/v2";

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
      return_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/trainers/success`,
      website_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}`,
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
    const response = await axios.post(`${KHALTI_API_URL}/epayment/initiate/`, payload, {
      headers: {
        Authorization: `Key ${KHALTI_LIVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
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
      `${KHALTI_API_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_LIVE_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
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
