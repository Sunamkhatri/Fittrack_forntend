import { z } from "zod";
import { UserSchema } from "../types/user.type.js";

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
  role: true,
  age: true,
  gender: true,
  weight: true,
  caloriesGoal: true,
});

export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});

export const UpdateUserDTO = UserSchema.omit({ password: true }).partial().extend({
  profileImage: z.string().optional().nullable(),
  bio: z.string().optional(),
  specialty: z.string().optional(),
  hourlyRate: z.number().optional(),
});

export const UpdatePasswordDTO = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const ForgotPasswordDTO = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordDTO = z.object({
  password: z.string().min(6, "New password must be at least 6 characters"),
});
