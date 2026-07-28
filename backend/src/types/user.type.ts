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
  age: z.number().int().min(13, "Must be at least 13 years old"),
  gender: z.enum(["male", "female", "other"]),
  weight: z.number().min(20, "Weight must be at least 20 kg"),
  caloriesGoal: z.number().optional().default(2000),
  role: z.enum(["admin", "user", "trainer"]).default("user"),
  bio: z.string().optional(),
  specialty: z.string().optional(),
  hourlyRate: z.number().optional().default(50),
  clients: z.array(z.string()).optional(),
  profileImage: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type UserType = z.infer<typeof UserSchema>;
