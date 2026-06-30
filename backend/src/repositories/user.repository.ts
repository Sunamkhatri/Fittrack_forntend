import { IUser, UserModel } from "../models/user.model.js";

// In-memory storage for when MongoDB is unavailable
interface StoredUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStore {
  private users: Map<string, StoredUser> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private usernameIndex: Map<string, string> = new Map();

  findByEmail(email: string): StoredUser | null {
    const id = this.emailIndex.get(email.toLowerCase());
    if (!id) return null;
    return this.users.get(id) || null;
  }

  findByUsername(username: string): StoredUser | null {
    const id = this.usernameIndex.get(username.toLowerCase());
    if (!id) return null;
    return this.users.get(id) || null;
  }

  findById(id: string): StoredUser | null {
    return this.users.get(id) || null;
  }

  create(user: Omit<StoredUser, "_id">): StoredUser {
    const id = Date.now().toString();
    const newUser: StoredUser = {
      ...user,
      _id: id,
    };

    this.users.set(id, newUser);
    this.emailIndex.set(user.email.toLowerCase(), id);
    this.usernameIndex.set(user.username.toLowerCase(), id);

    return newUser;
  }
}

const memoryStore = new MemoryStore();

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      console.warn("MongoDB unavailable, using memory store for findByEmail");
      const user = memoryStore.findByEmail(email);
      return user as unknown as IUser;
    }
  }

  async findByUsername(username: string): Promise<IUser | null> {
    try {
      return await UserModel.findOne({ username });
    } catch (error) {
      console.warn("MongoDB unavailable, using memory store for findByUsername");
      const user = memoryStore.findByUsername(username);
      return user as unknown as IUser;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(id);
    } catch (error) {
      console.warn("MongoDB unavailable, using memory store for findById");
      const user = memoryStore.findById(id);
      return user as unknown as IUser;
    }
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    try {
      const user = new UserModel(data);
      return await user.save();
    } catch (error) {
      console.warn("MongoDB unavailable, using memory store for create");
      const user = memoryStore.create({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        username: data.username || "",
        password: data.password || "",
        role: data.role || "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return user as unknown as IUser;
    }
  }

  async getAll(): Promise<IUser[]> {
    try {
      return await UserModel.find();
    } catch (error) {
      console.warn("MongoDB unavailable for getAll");
      return [];
    }
  }

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.warn("MongoDB unavailable for updateById");
      return null;
    }
  }

  async deleteById(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findByIdAndDelete(id);
    } catch (error) {
      console.warn("MongoDB unavailable for deleteById");
      return null;
    }
  }
}
