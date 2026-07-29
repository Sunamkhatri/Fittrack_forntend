import jwt from "jsonwebtoken";
import type { Response, NextFunction } from "express";
import {
  authMiddleware,
  AUTH_COOKIE_NAME,
  AuthRequest,
} from "../../../middlewares/auth.middleware.js";
import { HttpException } from "../../../exceptions/http-exception.js";
import { JWT_SECRET } from "../../../configs/constant.js";

function sign(payload: Record<string, unknown>, secret = JWT_SECRET) {
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

function mockRequest(init: {
  cookies?: Record<string, string>;
  authorization?: string;
}): AuthRequest {
  return {
    cookies: init.cookies ?? {},
    headers: init.authorization
      ? { authorization: init.authorization }
      : {},
  } as unknown as AuthRequest;
}

const claims = {
  id: "6a688389dd1269df9c02e59d",
  email: "athlete@fittrack.com",
  role: "user",
};

describe("authMiddleware", () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
  });

  it("should accept a token from the Authorization header", () => {
    const req = mockRequest({ authorization: `Bearer ${sign(claims)}` });

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject(claims);
  });

  it("should accept a token from the auth cookie", () => {
    const req = mockRequest({
      cookies: { [AUTH_COOKIE_NAME]: sign(claims) },
    });

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject(claims);
  });

  it("should prefer the cookie when both are present", () => {
    // Documents the current precedence: a stale cookie wins over a fresh
    // header. Worth knowing if a client ever sends both.
    const req = mockRequest({
      cookies: { [AUTH_COOKIE_NAME]: sign({ ...claims, role: "admin" }) },
      authorization: `Bearer ${sign({ ...claims, role: "user" })}`,
    });

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    expect(req.user?.role).toBe("admin");
  });

  it("should reject with 401 when no token is supplied", () => {
    const req = mockRequest({});

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    const error = next.mock.calls[0][0] as HttpException;
    expect(error).toBeInstanceOf(HttpException);
    expect(error.status).toBe(401);
    expect(req.user).toBeUndefined();
  });

  it("should reject a header that is not a Bearer scheme", () => {
    const req = mockRequest({ authorization: `Basic ${sign(claims)}` });

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    expect((next.mock.calls[0][0] as HttpException).status).toBe(401);
  });

  it("should reject a token signed with the wrong secret", () => {
    const req = mockRequest({
      authorization: `Bearer ${sign(claims, "a-different-secret")}`,
    });

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    const error = next.mock.calls[0][0] as HttpException;
    expect(error.status).toBe(401);
    expect(error.message).toMatch(/invalid or expired/i);
  });

  it("should reject an expired token", () => {
    const expired = jwt.sign(claims, JWT_SECRET, { expiresIn: "-1s" });
    const req = mockRequest({ authorization: `Bearer ${expired}` });

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    expect((next.mock.calls[0][0] as HttpException).status).toBe(401);
  });

  it("should reject a malformed cookie value", () => {
    const req = mockRequest({ cookies: { [AUTH_COOKIE_NAME]: "not-a-jwt" } });

    authMiddleware(req, {} as Response, next as unknown as NextFunction);

    expect((next.mock.calls[0][0] as HttpException).status).toBe(401);
  });

  it("should tolerate a request with no cookies object at all", () => {
    // cookie-parser populates req.cookies, but the middleware must not throw
    // if it is mounted before the parser or bypassed in a test.
    const req = { headers: {} } as unknown as AuthRequest;

    expect(() =>
      authMiddleware(req, {} as Response, next as unknown as NextFunction)
    ).not.toThrow();

    expect((next.mock.calls[0][0] as HttpException).status).toBe(401);
  });
});
