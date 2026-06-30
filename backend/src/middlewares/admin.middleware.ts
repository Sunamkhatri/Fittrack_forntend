import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { HttpException } from "../exceptions/http-exception.js";

export const adminMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new HttpException(403, "Forbidden: Admin access only"));
  }
  next();
};
