import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { adminMiddleware } from "./middlewares/admin.middleware.js";
import { HttpException } from "./exceptions/http-exception.js";
import { ResponseHelper } from "./utils/response.util.js";
import profileRoutes from "./routes/profile.route.js";
import paymentRoutes from "./routes/payment.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

app.use((_req: Request, res: Response) => {
  return ResponseHelper.error(res, 404, "Route not found");
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpException) {
    return ResponseHelper.error(res, err.status, err.message);
  }

  console.error(err);
  return ResponseHelper.error(res, 500, "Internal server error");
});

export default app;
