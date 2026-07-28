import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../src/app";
import { UserModel } from "../src/models/user.model";

const TEST_DB = process.env.MONGODB_URI || "mongodb://localhost:27017/fittrack";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

let userToken: string;
let adminToken: string;
let trainerToken: string;
let userId: string;
let trainerId: string;

// Short unique suffix that keeps username under 20 chars
const TS = String(Date.now()).slice(-6);
const testUser = {
  firstName: "Test",
  lastName: "User",
  email: `tu${TS}@test.com`,
  username: `tu${TS}`,
  password: "Test1234",
  age: 25,
  gender: "male",
  weight: 70,
};

const testTrainer = {
  firstName: "Test",
  lastName: "Trainer",
  email: `tt${TS}@test.com`,
  username: `tt${TS}`,
  password: "Test1234",
  role: "trainer",
  age: 30,
  gender: "male",
  weight: 80,
};

beforeAll(async () => {
  await mongoose.connect(TEST_DB);

  // Clean leftover test data
  await UserModel.deleteMany({ email: { $regex: `${TS}@test.com$` } });

  // Create admin directly in DB (bypasses registration role lockdown)
  const hashed = await bcrypt.hash("Admin1234", 12);
  const admin = await UserModel.create({
    firstName: "Test",
    lastName: "Admin",
    email: `ta${TS}@test.com`,
    username: `ta${TS}`,
    password: hashed,
    role: "admin",
    age: 35,
    gender: "male",
    weight: 75,
  });

  adminToken = jwt.sign(
    { id: admin._id.toString(), email: admin.email, role: "admin" },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
});

afterAll(async () => {
  await UserModel.deleteMany({ email: { $regex: `${TS}@test.com$` } });
  await mongoose.connection.close();
});

// ════════════════════════════════════════════════════════════
// 1. HEALTH CHECK
// ════════════════════════════════════════════════════════════

describe("Health Check", () => {
  it("1. GET /api/v1/health — returns 200", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("ok");
  });
});

// ════════════════════════════════════════════════════════════
// 2-9. AUTH — REGISTER
// ════════════════════════════════════════════════════════════

describe("Auth — Register", () => {
  it("2. registers a new user successfully", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
    userId = res.body.data.user._id;
  });

  it("3. registers a trainer successfully", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testTrainer);
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("trainer");
    trainerToken = res.body.data.token;
    trainerId = res.body.data.user._id;
  });

  it("4. rejects duplicate email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("5. rejects duplicate username", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      ...testUser,
      email: `dup${TS}@test.com`,
    });
    expect(res.status).toBe(400);
  });

  it("6. blocks admin role from self-registration", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "Blocked",
      lastName: "Admin",
      email: `na${TS}@test.com`,
      username: `na${TS}`,
      password: "Test1234",
      role: "admin",
      age: 25,
      gender: "male",
      weight: 70,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("user");
  });

  it("7. rejects missing required fields", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "incomplete@test.com",
    });
    expect(res.status).toBe(400);
  });

  it("8. rejects invalid email format", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      ...testUser,
      email: "notanemail",
      username: `ie${TS}`,
    });
    expect(res.status).toBe(400);
  });

  it("9. never returns password in response", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      firstName: "NoPwd",
      lastName: "User",
      email: `np${TS}@test.com`,
      username: `np${TS}`,
      password: "Test1234",
      age: 22,
      gender: "female",
      weight: 55,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();
  });
});

// ════════════════════════════════════════════════════════════
// 10-15. AUTH — LOGIN
// ════════════════════════════════════════════════════════════

describe("Auth — Login", () => {
  it("10. logs in with valid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
  });

  it("11. returns a valid JWT token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.token.split(".").length).toBe(3);
  });

  it("12. rejects wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: "WrongPassword",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it("13. rejects non-existent email", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "ghost@nowhere.com",
      password: "anything",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("14. rejects empty login body", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("15. works via legacy /api/auth/login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════
// 16-22. PROFILE
// ════════════════════════════════════════════════════════════

describe("Profile", () => {
  it("16. GET /api/v1/auth/me — returns user profile", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it("17. GET /api/v1/auth/whoami — returns identity", async () => {
    const res = await request(app)
      .get("/api/v1/auth/whoami")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it("18. rejects profile access without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it("19. rejects profile access with invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer fakeinvalidtoken123");
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it("20. GET /api/v1/users/profile — returns profile via users route", async () => {
    const res = await request(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it("21. PUT /api/v1/users/profile — updates profile data", async () => {
    const res = await request(app)
      .put("/api/v1/users/profile")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ firstName: "Updated", weight: 72 });
    expect(res.status).toBe(200);
  });

  it("22. PUT /api/v1/users/change-password — rejects wrong current password", async () => {
    const res = await request(app)
      .put("/api/v1/users/change-password")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ currentPassword: "WrongOldPass", newPassword: "NewPass123" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ════════════════════════════════════════════════════════════
// 23-27. TRAINERS & CLIENTS
// ════════════════════════════════════════════════════════════

describe("Trainers & Clients", () => {
  it("23. GET /api/v1/users/trainers — lists trainers", async () => {
    const res = await request(app)
      .get("/api/v1/users/trainers")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    const trainers = res.body.data?.trainers || [];
    expect(Array.isArray(trainers)).toBe(true);
  });

  it("24. includes seeded trainers like Adam", async () => {
    const res = await request(app)
      .get("/api/v1/users/trainers")
      .set("Authorization", `Bearer ${userToken}`);
    const trainers = res.body.data?.trainers || [];
    const names = trainers.map((t: any) => t.firstName);
    expect(names).toContain("Adam");
  });

  it("25. GET /api/v1/users/clients — trainer gets client list", async () => {
    const res = await request(app)
      .get("/api/v1/users/clients")
      .set("Authorization", `Bearer ${trainerToken}`);
    expect(res.status).toBe(200);
  });

  it("26. rejects trainers listing without auth", async () => {
    const res = await request(app).get("/api/v1/users/trainers");
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it("27. rejects clients listing without auth", async () => {
    const res = await request(app).get("/api/v1/users/clients");
    expect(res.status).toBeGreaterThanOrEqual(401);
  });
});

// ════════════════════════════════════════════════════════════
// 28-32. ADMIN
// ════════════════════════════════════════════════════════════

describe("Admin Panel", () => {
  it("28. GET /api/v1/admin/users — admin lists all users", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("29. rejects admin routes for regular users", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it("30. rejects admin routes without auth", async () => {
    const res = await request(app).get("/api/v1/admin/users");
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it("31. admin can delete a user", async () => {
    const tempRes = await request(app).post("/api/v1/auth/register").send({
      firstName: "Temp",
      lastName: "Del",
      email: `td${TS}@test.com`,
      username: `td${TS}`,
      password: "Test1234",
      age: 20,
      gender: "male",
      weight: 60,
    });
    const tempId = tempRes.body.data?.user?._id;
    expect(tempId).toBeDefined();

    const res = await request(app)
      .delete(`/api/v1/admin/users/${tempId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("32. rejects trainer from accessing admin routes", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${trainerToken}`);
    expect(res.status).toBeGreaterThanOrEqual(401);
  });
});

// ════════════════════════════════════════════════════════════
// 33-35. PAYMENT & MISC
// ════════════════════════════════════════════════════════════

describe("Payment & Misc", () => {
  it("33. POST /api/v1/payments/initiate — rejects without auth", async () => {
    const res = await request(app)
      .post("/api/v1/payments/initiate")
      .send({ trainerId: "fakeid", amount: 1000 });
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it("34. POST /api/v1/payments/verify — rejects without auth", async () => {
    const res = await request(app)
      .post("/api/v1/payments/verify")
      .send({ pidx: "fakepidx" });
    expect(res.status).toBeGreaterThanOrEqual(401);
  });

  it("35. GET /api/v1/nonexistent — returns 404", async () => {
    const res = await request(app).get("/api/v1/nonexistent");
    expect(res.status).toBe(404);
  });
});
