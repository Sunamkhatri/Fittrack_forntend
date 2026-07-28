import { Router } from "express";
import { initiatePayment, verifyPayment } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all payment routes
router.use(authMiddleware);

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);

export default router;
