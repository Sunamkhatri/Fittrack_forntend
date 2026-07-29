import type { Response } from "express";
import { ResponseHelper } from "../../../utils/response.util.js";

function mockResponse() {
  const res = {} as Response & { body?: any; statusCode?: number };
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

describe("ResponseHelper.success", () => {
  it("should send the given status and a success envelope", () => {
    const res = mockResponse();

    ResponseHelper.success(res, 201, "Created", { id: "abc" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      status: 201,
      success: true,
      message: "Created",
      data: { id: "abc" },
    });
  });

  it("should default data to an empty object when omitted", () => {
    const res = mockResponse();

    ResponseHelper.success(res, 200, "Done");

    expect(res.body.data).toEqual({});
  });
});

describe("ResponseHelper.error", () => {
  it("should send a failure envelope with success false", () => {
    const res = mockResponse();

    ResponseHelper.error(res, 404, "Not found");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 404,
      success: false,
      message: "Not found",
      data: {},
    });
  });

  it("should never report success true on an error", () => {
    const res = mockResponse();

    ResponseHelper.error(res, 500, "Internal server error");

    expect(res.body.success).toBe(false);
  });
});

describe("ResponseHelper.successWithMeta", () => {
  it("should include meta alongside the standard envelope", () => {
    const res = mockResponse();

    ResponseHelper.successWithMeta(res, 200, "Fetched", [{ id: 1 }], {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    expect(res.body).toMatchObject({
      status: 200,
      success: true,
      message: "Fetched",
      data: [{ id: 1 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it("should produce the same envelope shape as success, plus meta", () => {
    // This helper exists precisely so paginated routes stay consistent with
    // the rest of the API. GET /admin/users still hand-rolls its own shape.
    const plain = mockResponse();
    const withMeta = mockResponse();

    ResponseHelper.success(plain, 200, "Fetched", []);
    ResponseHelper.successWithMeta(withMeta, 200, "Fetched", [], { page: 1 });

    const { meta, ...rest } = withMeta.body;
    expect(rest).toEqual(plain.body);
    expect(meta).toBeDefined();
  });
});
