import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../../app.js";
import { UserModel } from "../../models/user.model.js";

export const TEST_DB =
  process.env.MONGODB_URI || "mongodb://localhost:27017/fittrack";
export const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";

/**
 * Per-file suffix keeping usernames under the 20-char limit.
 *
 * Jest runs suites in parallel workers against one database, so a timestamp
 * alone can collide when two files start in the same millisecond. The random
 * component keeps each file's fixtures disjoint, which is what lets every file
 * clean up by suffix without deleting another's data.
 */
export function testSuffix() {
  const time = String(Date.now()).slice(-5);
  const rand = Math.random().toString(36).slice(2, 5);
  return `${time}${rand}`;
}

export async function connectTestDb() {
  await mongoose.connect(TEST_DB);
}

export async function disconnectTestDb(suffix: string) {
  await UserModel.deleteMany({ email: { $regex: `${suffix}@test.com$` } });
  await mongoose.connection.close();
}

export async function cleanupSuffix(suffix: string) {
  await UserModel.deleteMany({ email: { $regex: `${suffix}@test.com$` } });
}

export function buildUser(suffix: string, overrides: Record<string, unknown> = {}) {
  return {
    firstName: "Test",
    lastName: "User",
    email: `tu${suffix}@test.com`,
    username: `tu${suffix}`,
    password: "Test1234",
    age: 25,
    gender: "male",
    weight: 70,
    ...overrides,
  };
}

/** Registers through the real endpoint so the password is hashed as in production. */
export async function registerAndLogin(
  suffix: string,
  overrides: Record<string, unknown> = {}
) {
  const payload = buildUser(suffix, overrides);
  const res = await request(app).post("/api/v1/auth/register").send(payload);
  return {
    payload,
    token: res.body.data?.token as string,
    user: res.body.data?.user,
    status: res.status,
  };
}

/**
 * Admins are created directly in the DB — registration deliberately downgrades
 * a self-assigned admin role, so there is no endpoint that can mint one.
 */
export async function createAdmin(suffix: string) {
  const hashed = await bcrypt.hash("Admin1234", 12);
  const admin = await UserModel.create({
    firstName: "Test",
    lastName: "Admin",
    email: `ta${suffix}@test.com`,
    username: `ta${suffix}`,
    password: hashed,
    role: "admin",
    age: 35,
    gender: "male",
    weight: 75,
  });

  const token = jwt.sign(
    { id: admin._id.toString(), email: admin.email, role: "admin" },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { admin, token };
}

export { app, request, mongoose, UserModel, jwt };
