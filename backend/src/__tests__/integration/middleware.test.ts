import jwt from "jsonwebtoken";
import {
  app,
  request,
  UserModel,
  JWT_SECRET,
  connectTestDb,
  disconnectTestDb,
  cleanupSuffix,
  testSuffix,
  registerAndLogin,
  createAdmin,
} from "../helpers/setup.js";

const TS = testSuffix();

let userToken: string;
let userId: string;
let adminToken: string;

beforeAll(async () => {
  await connectTestDb();
  await cleanupSuffix(TS);

  const user = await registerAndLogin(TS);
  userToken = user.token;
  userId = user.user._id;

  const admin = await createAdmin(TS);
  adminToken = admin.token;
});

afterAll(async () => {
  await disconnectTestDb(TS);
});

describe("authenticate middleware execution output", () => {
  describe("GET /api/v1/auth/whoami", () => {
    it("should return 401 when no token is provided", async () => {
      const res = await request(app).get("/api/v1/auth/whoami");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 when an invalid token is provided", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", "Bearer completelyinvalidtoken");

      expect(res.status).toBe(401);
    });

    it("should return 401 when a tampered token is provided", async () => {
      const tampered = `${userToken.slice(0, -4)}AAAA`;
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${tampered}`);

      expect(res.status).toBe(401);
    });

    it("should return 401 with Authorization header missing Bearer prefix", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", userToken);

      expect(res.status).toBe(401);
    });

    it("should return 200 when a valid Bearer token is provided", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 200 when a valid cookie token is provided", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Cookie", [`fittrack_token=${userToken}`]);

      expect(res.status).toBe(200);
    });

    it("should return 404 when the token is valid but the user no longer exists", async () => {
      // A signature stays valid until it expires, so a deleted account can
      // still present a well-formed token. The lookup behind the middleware is
      // what must reject it.
      const ghostId = "6a688389dd1269df9c02e59d";
      const ghostToken = jwt.sign(
        { id: ghostId, email: `ghost${TS}@test.com`, role: "user" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${ghostToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("authenticate attaches user context to request", () => {
    it("should resolve the authenticated user's own record", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${userToken}`);

      // Proves the middleware put the right id on the request, not just that
      // some user came back.
      expect(res.body.data.user._id).toBe(userId);
      expect(res.body.data.user.role).toBe("user");
      expect(res.body.data.user.password).toBeUndefined();
    });
  });
});

describe("requireAdmin middleware execution output", () => {
  describe("GET /api/v1/admin/users", () => {
    it("should return 403 when a non-admin user tries to access an admin route", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("should return 200 when an admin accesses the admin route", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it("should run after authenticate, so a missing token is 401 not 403", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.status).toBe(401);
    });
  });
});

describe("upload middleware execution output", () => {
  // A tiny but structurally valid PNG.
  const PNG = Buffer.from(
    "89504e470d0a1a0a0000000d494844520000000100000001080600000" +
      "01f15c4890000000a49444154789c6300010000050001od0a2db40000000049454e44ae426082",
    "hex"
  );

  it("should accept valid image files", async () => {
    const res = await request(app)
      .post("/api/v1/users/profile-image")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("profileImage", PNG, {
        filename: `ok${TS}.png`,
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.profileImage).toMatch(/^\/uploads\//);
  });

  it("should reject non-image file types", async () => {
    const res = await request(app)
      .post("/api/v1/users/profile-image")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("profileImage", Buffer.from("not an image"), {
        filename: `bad${TS}.txt`,
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    // The user must learn what was wrong, not just that something was.
    expect(res.body.message).toMatch(/JPEG and PNG/i);
  });

  it("should reject files larger than 5MB", async () => {
    const tooBig = Buffer.alloc(6 * 1024 * 1024, 0);

    const res = await request(app)
      .post("/api/v1/users/profile-image")
      .set("Authorization", `Bearer ${userToken}`)
      .attach("profileImage", tooBig, {
        filename: `huge${TS}.png`,
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/5 MB or smaller/i);
  });

  it("should require authentication before accepting an upload", async () => {
    const res = await request(app)
      .post("/api/v1/users/profile-image")
      .attach("profileImage", PNG, {
        filename: `noauth${TS}.png`,
        contentType: "image/png",
      });

    expect(res.status).toBe(401);
  });
});

describe("errorHandler middleware execution output", () => {
  it("should return JSON, not HTML, for an unmatched route", async () => {
    const res = await request(app).get(`/api/v1/definitely-not-a-route-${TS}`);

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toMatchObject({ success: false, message: "Route not found" });
  });

  it("should surface an HttpException's own status and message", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users/not-a-valid-object-id")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeTruthy();
  });

  it("should never leak a stack trace in the response body", async () => {
    const res = await request(app).get(`/api/v1/nope-${TS}`);
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\.ts:\d+/);
  });
});
