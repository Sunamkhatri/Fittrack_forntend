import {
  app,
  request,
  UserModel,
  connectTestDb,
  disconnectTestDb,
  cleanupSuffix,
  testSuffix,
  buildUser,
  registerAndLogin,
  createAdmin,
} from "../helpers/setup.js";

const TS = testSuffix();

let adminToken: string;
let userToken: string;
let trainerToken: string;

beforeAll(async () => {
  await connectTestDb();
  await cleanupSuffix(TS);

  const admin = await createAdmin(TS);
  adminToken = admin.token;

  const user = await registerAndLogin(TS);
  userToken = user.token;

  const trainer = await registerAndLogin(TS, {
    email: `tt${TS}@test.com`,
    username: `tt${TS}`,
    role: "trainer",
  });
  trainerToken = trainer.token;
});

afterAll(async () => {
  await disconnectTestDb(TS);
});

describe("GET /api/v1/admin/users", () => {
  it("should list users, paginated and sanitized, for an admin", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // NOTE: this route hand-rolls { data, meta } instead of going through
    // ResponseHelper, so unlike every other route it has no `success` field.
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
    expect(res.body.data.every((u: any) => u.password === undefined)).toBe(true);
  });

  it("should honour the limit parameter", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users?limit=2")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(2);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });

  it("should accept the admin token from the httpOnly cookie", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Cookie", [`fittrack_token=${adminToken}`]);

    expect(res.status).toBe(200);
  });

  it("should return 403 for a regular user, not merely 'not 200'", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should return 403 for a trainer", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${trainerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).get("/api/v1/admin/users");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/v1/admin/users/:id", () => {
  it("should delete a user", async () => {
    const temp = await request(app)
      .post("/api/v1/auth/register")
      .send(buildUser(TS, { email: `td${TS}@test.com`, username: `td${TS}` }));

    const tempId = temp.body.data?.user?._id;
    expect(tempId).toBeDefined();

    const res = await request(app)
      .delete(`/api/v1/admin/users/${tempId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // A 200 alone does not prove the row is gone.
    expect(await UserModel.findById(tempId)).toBeNull();
  });

  it("should return 403 when a non-admin attempts a delete", async () => {
    const res = await request(app)
      .delete("/api/v1/admin/users/6a688389dd1269df9c02e59d")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 400 for a malformed id", async () => {
    const res = await request(app)
      .delete("/api/v1/admin/users/not-an-object-id")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
