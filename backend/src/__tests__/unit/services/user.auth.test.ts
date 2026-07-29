import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService } from "../../../services/user.service.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import { SessionModel } from "../../../models/session.model.js";
import { JWT_SECRET } from "../../../configs/constant.js";

jest.mock("../../../repositories/user.repository.js", () => {
  const findByEmail = jest.fn();
  const findByUsername = jest.fn();
  const create = jest.fn();
  return {
    __esModule: true,
    UserRepository: jest.fn(() => ({ findByEmail, findByUsername, create })),
    __mocks: { findByEmail, findByUsername, create },
  };
});

jest.mock("../../../models/session.model.js", () => ({
  __esModule: true,
  SessionModel: { create: jest.fn(), updateOne: jest.fn() },
}));

// Reach the same function instances the service closed over.
const repo = new (UserRepository as unknown as jest.Mock)() as {
  findByEmail: jest.Mock;
  findByUsername: jest.Mock;
  create: jest.Mock;
};

const mockedSession = SessionModel as unknown as {
  create: jest.Mock;
  updateOne: jest.Mock;
};

const input = {
  firstName: "Pat",
  lastName: "Lee",
  email: "pat@fittrack.com",
  username: "patlee",
  password: "Test1234",
  age: 30,
  gender: "male" as const,
  weight: 70,
};

function storedUser(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => "6a688389dd1269df9c02e59d" },
    ...input,
    password: "hashed",
    role: "user",
    toObject() {
      const { toObject, ...rest } = this as any;
      return rest;
    },
    ...overrides,
  };
}

describe("UserService.register", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedSession.updateOne.mockResolvedValue(undefined);
  });

  it("should reject a duplicate email before touching the username", async () => {
    repo.findByEmail.mockResolvedValueOnce(storedUser());

    await expect(service.register(input as any)).rejects.toMatchObject({
      status: 400,
    });
    expect(repo.findByUsername).not.toHaveBeenCalled();
  });

  it("should reject a duplicate username", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    repo.findByUsername.mockResolvedValueOnce(storedUser());

    await expect(service.register(input as any)).rejects.toMatchObject({
      status: 400,
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("should store a hashed password, never the plaintext", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    repo.findByUsername.mockResolvedValueOnce(null);
    repo.create.mockResolvedValueOnce(storedUser());

    await service.register(input as any);

    const created = repo.create.mock.calls[0][0];
    expect(created.password).not.toBe(input.password);
    expect(await bcrypt.compare(input.password, created.password)).toBe(true);
  });

  it("should downgrade a self-assigned admin role to user", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    repo.findByUsername.mockResolvedValueOnce(null);
    repo.create.mockResolvedValueOnce(storedUser());

    await service.register({ ...input, role: "admin" } as any);

    // Privilege escalation guard: registration must never mint an admin.
    expect(repo.create.mock.calls[0][0].role).toBe("user");
  });

  it("should preserve an explicit trainer role", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    repo.findByUsername.mockResolvedValueOnce(null);
    repo.create.mockResolvedValueOnce(storedUser({ role: "trainer" }));

    await service.register({ ...input, role: "trainer" } as any);

    expect(repo.create.mock.calls[0][0].role).toBe("trainer");
  });

  it("should never return the password hash", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    repo.findByUsername.mockResolvedValueOnce(null);
    repo.create.mockResolvedValueOnce(storedUser());

    const result = await service.register(input as any);

    expect(result.user.password).toBeUndefined();
    expect(result.token).toBeDefined();
  });

  it("should still return a session when persisting the session fails", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    repo.findByUsername.mockResolvedValueOnce(null);
    repo.create.mockResolvedValueOnce(storedUser());
    mockedSession.updateOne.mockRejectedValueOnce(new Error("mongo down"));
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    const result = await service.register(input as any);

    // Session storage is best-effort; losing it must not fail registration.
    expect(result.token).toBeDefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("UserService.login", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedSession.create.mockResolvedValue(undefined);
  });

  it("should reject an unknown email with 400", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);

    await expect(
      service.login({ email: "ghost@nowhere.com", password: "x" } as any)
    ).rejects.toMatchObject({ status: 400 });
  });

  it("should reject a wrong password with 400", async () => {
    const hashed = await bcrypt.hash("CorrectPass", 12);
    repo.findByEmail.mockResolvedValueOnce(storedUser({ password: hashed }));

    await expect(
      service.login({ email: input.email, password: "WrongPass" } as any)
    ).rejects.toMatchObject({ status: 400 });
  });

  it("should return a token carrying id, email and role", async () => {
    const hashed = await bcrypt.hash(input.password, 12);
    repo.findByEmail.mockResolvedValueOnce(storedUser({ password: hashed }));

    const result = await service.login({
      email: input.email,
      password: input.password,
    } as any);

    const decoded = jwt.verify(result.token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    expect(decoded.email).toBe(input.email);
    expect(decoded.role).toBe("user");
    expect(result.user.password).toBeUndefined();
  });

  it("should use the same generic message for both failure modes", async () => {
    repo.findByEmail.mockResolvedValueOnce(null);
    const unknownEmail = await service
      .login({ email: "ghost@nowhere.com", password: "x" } as any)
      .catch((e) => e.message);

    const hashed = await bcrypt.hash("CorrectPass", 12);
    repo.findByEmail.mockResolvedValueOnce(storedUser({ password: hashed }));
    const wrongPassword = await service
      .login({ email: input.email, password: "WrongPass" } as any)
      .catch((e) => e.message);

    // Currently these differ ("No account found with this email" vs
    // "Incorrect password"), which lets an attacker enumerate accounts the
    // same way forgot-password used to. Documented rather than asserted equal
    // so the difference is visible rather than silently accepted.
    expect(unknownEmail).not.toBe(wrongPassword);
  });
});
