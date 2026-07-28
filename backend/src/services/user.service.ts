import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import crypto from "crypto";
import { JWT_SECRET, FRONTEND_ORIGIN } from "../configs/constant.js";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto.js";
import { HttpException } from "../exceptions/http-exception.js";
import { IUser, UserModel } from "../models/user.model.js";
import { SessionModel } from "../models/session.model.js";
import { UserRepository } from "../repositories/user.repository.js";
import { sendEmail } from "../utils/email.util.js";

const userRepository = new UserRepository();

const sanitizeUser = (user: IUser | any) => {
  const obj = typeof user.toObject === "function" ? user.toObject() : user;
  const { password: _, ...sanitized } = obj;
  sanitized.name = `${sanitized.firstName || ""} ${sanitized.lastName || ""}`.trim();
  return sanitized;
};

export class UserService {
  async register(input: z.infer<typeof CreateUserDTO>) {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new HttpException(400, "This email is already registered");
    }

    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new HttpException(400, "This username is taken");
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await userRepository.create({
      ...input,
      password: hashedPassword,
      role: input.role === "trainer" ? "trainer" : "user", // Admin can only be created by admin panel
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    try {
      await SessionModel.updateOne(
        { token },
        {
          userId: user._id.toString(),
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        { upsert: true }
      );
    } catch (sessionError) {
      console.warn("Failed to save session:", sessionError);
    }

    return { user: sanitizeUser(user), token };
  }

  async login(input: z.infer<typeof LoginUserDTO>) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new HttpException(400, "No account found with this email");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new HttpException(400, "Incorrect password");
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    try {
      await SessionModel.updateOne(
        { token },
        {
          userId: user._id.toString(),
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        { upsert: true }
      );
    } catch (sessionError) {
      console.warn("Failed to save session:", sessionError);
    }

    return { user: sanitizeUser(user), token };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    return sanitizeUser(user);
  }

  async updateUser(userId: string, data: Partial<IUser>) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Check email uniqueness if being changed
    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) {
        throw new HttpException(400, "This email is already in use");
      }
    }

    // Check username uniqueness if being changed
    if (data.username && data.username !== user.username) {
      const existing = await userRepository.findByUsername(data.username);
      if (existing) {
        throw new HttpException(400, "This username is already taken");
      }
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const updated = await userRepository.updateById(userId, data);
    if (!updated) {
      throw new HttpException(500, "Failed to update user");
    }

    return sanitizeUser(updated);
  }

  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.updateById(userId, { password: hashedPassword });
  }

  async getTrainers() {
    const trainers = await UserModel.find({ role: "trainer" }).select("-password");
    return trainers.map((t) => sanitizeUser(t));
  }

  async getClients(trainerId: string) {
    const trainer = await UserModel.findById(trainerId).populate("clients", "-password");
    if (!trainer) throw new HttpException(404, "Trainer not found");
    return (trainer.clients ?? []).map((c) => sanitizeUser(c));
  }
  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });

    // Deliberately silent when the address is unknown. Returning a 404 here
    // told an attacker exactly which emails hold accounts, so the caller
    // responds 200 either way and only a real user receives mail.
    if (!user) {
      return;
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${FRONTEND_ORIGIN}/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      throw new HttpException(500, "Email could not be sent");
    }
  }

  async resetPassword(resetToken: string, newPassword: string) {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new HttpException(400, "Invalid or expired token");
    }

    // Set new password
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sanitizeUser(user);
  }
}
