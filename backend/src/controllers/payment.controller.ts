import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";
import { ResponseHelper } from "../utils/response.util.js";

const paymentService = new PaymentService();

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { trainerId, amount } = req.body;
    const userId = (req as any).user._id || (req as any).user.id;

    const result = await paymentService.initiatePayment(userId, trainerId, amount);

    return ResponseHelper.success(res, 200, "Khalti Payment initiated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pidx } = req.body;

    const result = await paymentService.verifyPayment(pidx);

    return ResponseHelper.success(res, 200, "Payment verified and subscription activated successfully!", result);
  } catch (error) {
    next(error);
  }
};
