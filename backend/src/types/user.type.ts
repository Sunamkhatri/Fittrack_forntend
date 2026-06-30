import { z } from "zod";

export const UserSchema = z.object({
  firstName: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, "First name must contain letters only"),
  lastName: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/, "Last name must contain letters only"),
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must be alphanumeric with underscores only, no spaces"
    ),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "user"]).default("user"),
  profileImage: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type UserType = z.infer<typeof UserSchema>;
