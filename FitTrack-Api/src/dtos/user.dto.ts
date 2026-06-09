import { UserSchema } from "../types/user.type.js";

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
});

export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});
