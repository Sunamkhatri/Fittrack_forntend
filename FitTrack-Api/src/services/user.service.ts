import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { JWT_SECRET } from "../configs/constant.js";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto.js";
import { HttpException } from "../exceptions/http-exception.js";
import { IUser } from "../models/user.model.js";
import { UserRepository } from "../repositories/user.repository.js";

const userRepository = new UserRepository();

const sanitizeUser = (user: IUser) => {
  const obj = user.toObject();
  const { password: _, ...sanitized } = obj;
  return sanitized;
};

export class UserService {
  async register(input: z.infer<typeof CreateUserDTO>) {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new HttpException(400, "This email is already registered");
    }

    const existingUsername = await userRepository.findByUsername(
      input.username
    );
    if (existingUsername) {
      throw new HttpException(400, "This username is taken");
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await userRepository.create({
      ...input,
      password: hashedPassword,
      role: "user",
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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

    return { user: sanitizeUser(user), token };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return sanitizeUser(user);
  }
}
