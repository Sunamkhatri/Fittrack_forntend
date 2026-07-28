import {
  app,
  request,
  connectTestDb,
  disconnectTestDb,
  cleanupSuffix,
  testSuffix,
  buildUser,
  registerAndLogin,
} from "../helpers/setup.js";

const TS = testSuffix();
const testUser = buildUser(TS);

let userToken: string;
let trainerToken: string;

beforeAll(async () => {
  await connectTestDb();
  await cleanupSuffix(TS);

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

describe("GET /api/v1/users/profile", () => {
  it("should return the authenticated user's profile", async () => {
    const res = await request(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).get("/api/v1/users/profile");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("PUT /api/v1/users/profile", () => {
  it("should persist the updated profile data", async () => {
    const res = await request(app)
      .put("/api/v1/users/profile")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ firstName: "Updated", weight: 72 });

    expect(res.status).toBe(200);

    // A 200 alone does not prove it was written — re-read it.
    const reread = await request(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${userToken}`);

    expect(reread.body.data.user.firstName).toBe("Updated");
    expect(reread.body.data.user.weight).toBe(72);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app)
      .put("/api/v1/users/profile")
      .send({ firstName: "Nope" });

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/v1/users/change-password", () => {
  it("should return 400 for a wrong current password", async () => {
    const res = await request(app)
      .put("/api/v1/users/change-password")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ currentPassword: "WrongOldPass", newPassword: "NewPass123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should leave the existing password usable after a failed change", async () => {
    const login = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(login.status).toBe(200);
  });
});

describe("GET /api/v1/users/trainers", () => {
  it("should list trainers", async () => {
    const res = await request(app)
      .get("/api/v1/users/trainers")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.trainers)).toBe(true);
  });

  it("should include the trainer registered by this suite, and only trainers", async () => {
    const res = await request(app)
      .get("/api/v1/users/trainers")
      .set("Authorization", `Bearer ${userToken}`);

    const trainers = res.body.data.trainers;

    expect(trainers.map((t: any) => t.email)).toContain(`tt${TS}@test.com`);
    expect(trainers.every((t: any) => t.role === "trainer")).toBe(true);
    expect(trainers.every((t: any) => t.password === undefined)).toBe(true);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).get("/api/v1/users/trainers");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/users/clients", () => {
  it("should return the trainer's client list", async () => {
    const res = await request(app)
      .get("/api/v1/users/clients")
      .set("Authorization", `Bearer ${trainerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.clients)).toBe(true);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).get("/api/v1/users/clients");
    expect(res.status).toBe(401);
  });
});
