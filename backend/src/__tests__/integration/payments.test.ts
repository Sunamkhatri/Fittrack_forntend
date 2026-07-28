import {
  app,
  request,
  connectTestDb,
  disconnectTestDb,
  cleanupSuffix,
  testSuffix,
  registerAndLogin,
} from "../helpers/setup.js";

const TS = testSuffix();

let userToken: string;

beforeAll(async () => {
  await connectTestDb();
  await cleanupSuffix(TS);

  const user = await registerAndLogin(TS);
  userToken = user.token;
});

afterAll(async () => {
  await disconnectTestDb(TS);
});

describe("POST /api/v1/payments/initiate", () => {
  it("should return 401 without a token", async () => {
    const res = await request(app)
      .post("/api/v1/payments/initiate")
      .send({ trainerId: "fakeid", amount: 1000 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 when the trainer does not exist", async () => {
    const res = await request(app)
      .post("/api/v1/payments/initiate")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ trainerId: "6a688389dd1269df9c02e59d", amount: 1000 });

    // Rejected before any Khalti call, so this needs no network and no key.
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/v1/payments/verify", () => {
  it("should return 401 without a token", async () => {
    const res = await request(app)
      .post("/api/v1/payments/verify")
      .send({ pidx: "fakepidx" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 for an unknown pidx", async () => {
    const res = await request(app)
      .post("/api/v1/payments/verify")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ pidx: `missing-${TS}` });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("unmatched routes", () => {
  it("should return 404 for an unknown path", async () => {
    const res = await request(app).get("/api/v1/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("should return 404 for an unknown method on a known path", async () => {
    const res = await request(app).patch("/api/v1/health");
    expect(res.status).toBe(404);
  });
});
