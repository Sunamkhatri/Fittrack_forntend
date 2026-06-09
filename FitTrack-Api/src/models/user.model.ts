import { Schema, model, Document } from "mongoose";
import { UserType } from "../types/user.type.js";

export interface IUser extends Omit<UserType, "password">, Document {
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
