import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant.js";
import { HttpException } from "../exceptions/http-exception.js";

// Must match the cookie the Next.js app sets in lib/cookies/token.ts.
export const AUTH_COOKIE_NAME = "fittrack_token";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Reads the JWT from the httpOnly cookie OR the Authorization header,
 * verifies it, and attaches the decoded claims to the request.
 *
 * The cookie is what the browser sends on its own once the frontend has
 * logged in; the Bearer header is what the test suite and the Flutter client
 * use. Accepting both means neither has to know about the other.
 */
export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const fromCookie = req.cookies?.[AUTH_COOKIE_NAME];

  const header = req.headers.authorization;
  const fromHeader = header?.startsWith("Bearer ")
    ? header.slice(7)
    : undefined;

  const token = fromCookie || fromHeader;

  if (!token) {
    return next(new HttpException(401, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    next(new HttpException(401, "Invalid or expired token"));
  }
};
