import { Request, Response, NextFunction } from "express";
import { HttpException } from "../exceptions/http-exception.js";
import { ResponseHelper } from "../utils/response.util.js";

export const DEFAULT_ERROR_MESSAGE = "Internal server error";

/** Terminal 404 for any request that matched no route. */
export const notFoundHandler = (_req: Request, res: Response) => {
  return ResponseHelper.error(res, 404, "Route not found");
};

/**
 * Express error handler.
 *
 * HttpException carries a deliberate status and a message safe to return to the
 * client. Anything else is unexpected, so it is logged and reported as a
 * generic 500 rather than leaking an internal message.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HttpException) {
    return ResponseHelper.error(res, err.status, err.message);
  }

  console.error(err);
  return ResponseHelper.error(res, 500, DEFAULT_ERROR_MESSAGE);
};
