import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { HttpException } from "../exceptions/http-exception.js";
import { ResponseHelper } from "../utils/response.util.js";
import { MAX_UPLOAD_BYTES } from "./upload.middleware.js";

export const DEFAULT_ERROR_MESSAGE = "Internal server error";

const MB = MAX_UPLOAD_BYTES / (1024 * 1024);

/** Multer raises these itself, so they never pass through our fileFilter. */
function multerMessage(err: MulterError) {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return `Image must be ${MB} MB or smaller`;
    case "LIMIT_FILE_COUNT":
      return "Only one image may be uploaded at a time";
    case "LIMIT_UNEXPECTED_FILE":
      return `Unexpected file field "${err.field}"`;
    default:
      return "Upload failed";
  }
}

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

  // A rejected upload is the client's mistake. Without this it reaches the
  // generic branch below and the user is told the server failed, with no hint
  // that their file was too large or the wrong type.
  if (err instanceof MulterError) {
    return ResponseHelper.error(res, 400, multerMessage(err));
  }

  console.error(err);
  return ResponseHelper.error(res, 500, DEFAULT_ERROR_MESSAGE);
};
