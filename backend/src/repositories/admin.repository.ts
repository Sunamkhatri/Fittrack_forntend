import { IUser, UserModel } from "../models/user.model.js";

export class AdminRepository {
  private getSearchQuery(search?: string) {
    if (!search || search.trim() === "") {
      return {};
    }
    const cleanSearch = search.trim();
    return {
      $or: [
        { firstName: { $regex: cleanSearch, $options: "i" } },
        { lastName: { $regex: cleanSearch, $options: "i" } },
        { email: { $regex: cleanSearch, $options: "i" } },
      ],
    };
  }

  async findPaginated(search: string, page: number, limit: number): Promise<IUser[]> {
    const query = this.getSearchQuery(search);
    return await UserModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async count(search: string): Promise<number> {
    const query = this.getSearchQuery(search);
    return await UserModel.countDocuments(query);
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return await user.save();
  }

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }
}
