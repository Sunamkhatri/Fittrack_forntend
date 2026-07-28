import { IUser, UserModel } from "../models/user.model.js";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username });
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return await user.save();
  }

  async getAll(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
