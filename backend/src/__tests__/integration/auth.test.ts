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
let userId: string;

beforeAll(async () => {
  await connectTestDb();
  await cleanupSuffix(TS);
});

afterAll(async () => {
  await disconnectTestDb(TS);
});

describe("GET /api/v1/health", () => {
  it("should return 200 and an ok status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });
});

describe("POST /api/v1/auth/register", () => {
  it("should register a new user and return 201", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();

    userToken = res.body.data.token;
    userId = res.body.data.user._id;
  });

  it("should never return the password hash", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(buildUser(TS, { email: `np${TS}@test.com`, username: `np${TS}` }));

    expect(res.status).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("should return 400 when the email already exists", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when the username already exists", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...testUser, email: `dup${TS}@test.com` });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for a missing body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "incomplete@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for an invalid email format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...testUser, email: "notanemail", username: `ie${TS}` });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should downgrade a self-assigned admin role to user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(
      buildUser(TS, {
        email: `na${TS}@test.com`,
        username: `na${TS}`,
        role: "admin",
      })
    );

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("user");
  });
});

describe("POST /api/v1/auth/login", () => {
  it("should login successfully and return a token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
  });

  it("should return a token carrying the user's id, email and role", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    const { jwt, JWT_SECRET } = await import("../helpers/setup.js");
    const decoded = jwt.verify(res.body.data.token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    expect(decoded.id).toBe(userId);
    expect(decoded.email).toBe(testUser.email);
    expect(decoded.role).toBe("user");
  });

  it("should return 400 for an invalid password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "WrongPassword",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.data?.token).toBeUndefined();
  });

  it("should return 400 for a non-existent email", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "ghost@nowhere.com",
      password: "anything",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for an empty body", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should work via the legacy /api/auth/login alias", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});

describe("GET /api/v1/auth/me", () => {
  it("should return the current user when authenticated by header", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("should accept the token from the httpOnly cookie", async () => {
    // The browser sends this on its own once the Next app has logged in; no
    // Authorization header is involved.
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", [`fittrack_token=${userToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 with an invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer fakeinvalidtoken123");

    expect(res.status).toBe(401);
  });

  it("should return 401 with a tampered token", async () => {
    const tampered = `${userToken.slice(0, -4)}AAAA`;
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${tampered}`);

    expect(res.status).toBe(401);
  });

  it("should return 401 for a malformed cookie token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", ["fittrack_token=not-a-jwt"]);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/auth/whoami", () => {
  it("should return the identity when authenticated", async () => {
    const res = await request(app)
      .get("/api/v1/auth/whoami")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /api/v1/auth/forgot-password", () => {
  it("should return 200 even when the email does not exist (security)", async () => {
    // A 404 here would confirm which addresses have accounts, letting an
    // attacker enumerate the user base.
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "definitely-not-registered@nowhere.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 400 for an invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "notanemail" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for an empty body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/v1/auth/reset-password/:token", () => {
  it("should return 400 for an invalid reset token", async () => {
    const res = await request(app)
      .put("/api/v1/auth/reset-password/invalidtoken123")
      .send({ password: "NewPass1234" });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for an invalid body", async () => {
    const res = await request(app)
      .put("/api/v1/auth/reset-password/sometoken")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("registration fixtures", () => {
  it("should register an independent trainer via the helper", async () => {
    const trainer = await registerAndLogin(TS, {
      email: `tt${TS}@test.com`,
      username: `tt${TS}`,
      role: "trainer",
    });

    expect(trainer.status).toBe(201);
    expect(trainer.user.role).toBe("trainer");
    expect(trainer.token).toBeDefined();
  });
});
