import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import {
  errorHandler,
  notFoundHandler,
  DEFAULT_ERROR_MESSAGE,
} from "../../../middlewares/error.middleware.js";
import { HttpException } from "../../../exceptions/http-exception.js";

// Minimal Express double: json() records what was sent, status() chains.
function mockResponse() {
  const res = {} as Response & { body?: unknown; statusCode?: number };
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  }) as unknown as Response["status"];
  res.json = jest.fn((payload: unknown) => {
    res.body = payload;
    return res;
  }) as unknown as Response["json"];
  return res;
}

describe("errorHandler", () => {
  let consoleError: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("should log the error when status is 500", () => {
    const res = mockResponse();

    errorHandler(
      new Error("boom"),
      {} as Request,
      res,
      (() => {}) as NextFunction
    );

    expect(res.statusCode).toBe(500);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("should not log the error when status is not 500", () => {
    const res = mockResponse();

    errorHandler(
      new HttpException(404, "Trainer not found"),
      {} as Request,
      res,
      (() => {}) as NextFunction
    );

    expect(res.statusCode).toBe(404);
    // A deliberate HttpException is expected control flow, not a defect.
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("should use the default message when the error is not an HttpException", () => {
    const res = mockResponse();

    errorHandler(
      new Error("mongo credentials leaked in here"),
      {} as Request,
      res,
      (() => {}) as NextFunction
    );

    expect(res.body).toMatchObject({
      success: false,
      message: DEFAULT_ERROR_MESSAGE,
    });
  });

  it("should pass through the HttpException's own status and message", () => {
    const res = mockResponse();

    errorHandler(
      new HttpException(403, "Forbidden: Admin access only"),
      {} as Request,
      res,
      (() => {}) as NextFunction
    );

    expect(res.body).toMatchObject({
      status: 403,
      success: false,
      message: "Forbidden: Admin access only",
    });
  });
});

describe("notFoundHandler", () => {
  it("should respond 404 for an unmatched route", () => {
    const res = mockResponse();

    notFoundHandler({} as Request, res);

    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: "Route not found" });
  });
});
