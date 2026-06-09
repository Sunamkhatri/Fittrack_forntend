import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/user.route.js";
import { HttpException } from "./exceptions/http-exception.js";
import { ResponseHelper } from "./utils/response.util.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (_req: Request, res: Response) => {
  return ResponseHelper.success(res, 200, "FitTrack API is running", {
    status: "ok",
  });
});

app.use("/api/v1/auth", userRoutes);

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
