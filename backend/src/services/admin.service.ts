import bcrypt from "bcryptjs";
import { AdminRepository } from "../repositories/admin.repository.js";
import { IUser } from "../models/user.model.js";
import { HttpException } from "../exceptions/http-exception.js";
import { PaymentModel } from "../models/payment.model.js";

const adminRepository = new AdminRepository();

const sanitizeUser = (user: IUser) => {
  const obj = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, ...sanitized } = obj;
  sanitized.name = `${sanitized.firstName || ""} ${sanitized.lastName || ""}`.trim();
  return sanitized;
};

export class AdminService {
  async getUsers(search: string, page: number, limit: number) {
    const users = await adminRepository.findPaginated(search, page, limit);
    const total = await adminRepository.count(search);
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(sanitizeUser),
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getUser(id: string) {
    const user = await adminRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    return sanitizeUser(user);
  }

  async createUser(data: { name: string; email: string; password?: string; role?: string }) {
    const existing = await adminRepository.findByEmail(data.email);
    if (existing) {
      throw new HttpException(400, "This email is already registered");
    }

    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const emailPrefix = data.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    const username = `${emailPrefix}_${Math.floor(100 + Math.random() * 900)}`;

    const passwordToHash = data.password || "Password123";
    const hashedPassword = await bcrypt.hash(passwordToHash, 12);

    const user = await adminRepository.create({
      firstName,
      lastName,
      email: data.email,
      username,
      password: hashedPassword,
      role: (data.role as "admin" | "user") || "user",
      status: "active",
    });

    return sanitizeUser(user);
  }

  async updateUser(
    id: string,
    data: { name?: string; email?: string; role?: string; status?: string }
  ) {
    const user = await adminRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const updateData: Partial<IUser> = {};

    if (data.email && data.email !== user.email) {
      const existing = await adminRepository.findByEmail(data.email);
      if (existing) {
        throw new HttpException(400, "This email is already taken");
      }
      updateData.email = data.email;
    }

    if (data.name) {
      const nameParts = data.name.trim().split(/\s+/);
      updateData.firstName = nameParts[0] || "";
      updateData.lastName = nameParts.slice(1).join(" ") || "";
    }

    if (data.role) {
      updateData.role = data.role as any;
    }

    if (data.status) {
      updateData.status = data.status as any;
    }

    const updated = await adminRepository.updateById(id, updateData);
    if (!updated) {
      throw new HttpException(500, "Failed to update user");
    }

    return sanitizeUser(updated);
  }

  async deleteUser(id: string) {
    const user = await adminRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    await adminRepository.deleteById(id);
  }

  async getRevenue() {
    const payments = await PaymentModel.find()
      .populate("user", "firstName lastName email")
      .populate("trainer", "firstName lastName email")
      .sort({ createdAt: -1 });
      
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalRevenue, transactions: payments };
  }
}
