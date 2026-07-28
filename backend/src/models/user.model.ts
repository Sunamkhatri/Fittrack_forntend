import { Schema, model, Document } from "mongoose";
import { UserType } from "../types/user.type.js";
import crypto from "crypto";

export interface IUser extends Omit<UserType, "password">, Document {
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  getResetPasswordToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    weight: { type: Number, required: true },
    caloriesGoal: { type: Number, default: 2000 },
    role: { type: String, enum: ["admin", "user", "trainer"], default: "user" },
    bio: { type: String, default: "" },
    specialty: { type: String, default: "" },
    hourlyRate: { type: Number, default: 50 },
    clients: [{ type: Schema.Types.ObjectId, ref: "User" }],
    profileImage: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export const UserModel = model<IUser>("User", userSchema);
