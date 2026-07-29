import type { Response, NextFunction } from "express";
import { adminMiddleware } from "../../../middlewares/admin.middleware.js";
import { AuthRequest } from "../../../middlewares/auth.middleware.js";
import { HttpException } from "../../../exceptions/http-exception.js";

function requestAs(role?: string): AuthRequest {
  return (role ? { user: { id: "1", email: "u@t.com", role } } : {}) as AuthRequest;
}

describe("adminMiddleware", () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
  });

  it("should call next with no error for an admin", () => {
    adminMiddleware(
      requestAs("admin"),
      {} as Response,
      next as unknown as NextFunction
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("should reject a regular user with 403, not 401", () => {
    adminMiddleware(
      requestAs("user"),
      {} as Response,
      next as unknown as NextFunction
    );

    const error = next.mock.calls[0][0] as HttpException;
    // 403 not 401: the caller is authenticated, just not permitted. Collapsing
    // these would tell an attacker their token was rejected rather than their
    // role.
    expect(error.status).toBe(403);
  });

  it("should reject a trainer with 403", () => {
    adminMiddleware(
      requestAs("trainer"),
      {} as Response,
      next as unknown as NextFunction
    );

    expect((next.mock.calls[0][0] as HttpException).status).toBe(403);
  });

  it("should reject when no user was attached by authMiddleware", () => {
    adminMiddleware(
      requestAs(),
      {} as Response,
      next as unknown as NextFunction
    );

    expect((next.mock.calls[0][0] as HttpException).status).toBe(403);
  });

  it("should not treat a role that merely contains 'admin' as admin", () => {
    // Guards against the check ever loosening to a substring match.
    adminMiddleware(
      requestAs("not-admin"),
      {} as Response,
      next as unknown as NextFunction
    );

    expect((next.mock.calls[0][0] as HttpException).status).toBe(403);
  });
});
