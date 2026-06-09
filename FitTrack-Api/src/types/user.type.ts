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
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
  role: z.enum(["admin", "user"]).default("user"),
});

export type UserType = z.infer<typeof UserSchema>;
