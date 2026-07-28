import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { adminMiddleware } from "./middlewares/admin.middleware.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { ResponseHelper } from "./utils/response.util.js";
import profileRoutes from "./routes/profile.route.js";
import paymentRoutes from "./routes/payment.route.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
// Resolved from cwd rather than import.meta.url so the module compiles under
// both ESM and CommonJS. upload.middleware writes here using the same base, so
// the served path and the write path cannot drift apart.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/v1/health", (_req: Request, res: Response) => {
  return ResponseHelper.success(res, 200, "FitTrack API is running", {
    status: "ok",
  });
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/auth", userRoutes); // Compatibility route for Flutter client
app.use("/api/v1/users", profileRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin/users", authMiddleware, adminMiddleware, adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
