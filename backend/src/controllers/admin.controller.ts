import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { AdminService } from "../services/admin.service.js";
import { ResponseHelper } from "../utils/response.util.js";
import { CreateUserAdminDTO, UpdateUserAdminDTO } from "../dtos/admin.dto.js";

const adminService = new AdminService();

export class AdminController {
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      const result = await adminService.getUsers(search, page, limit);

      return res.status(200).json({
        data: result.users,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHelper.error(res, 400, "Invalid user ID format");
      }

      const user = await adminService.getUser(id);
      return ResponseHelper.success(res, 200, "User fetched successfully", user);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = CreateUserAdminDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(res, 400, parsed.error.issues[0].message);
      }

      const user = await adminService.createUser(parsed.data);
      return ResponseHelper.success(res, 201, "User created successfully", user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHelper.error(res, 400, "Invalid user ID format");
      }

      const parsed = UpdateUserAdminDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(res, 400, parsed.error.issues[0].message);
      }

      const user = await adminService.updateUser(id, parsed.data);
      return ResponseHelper.success(res, 200, "User updated successfully", user);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return ResponseHelper.error(res, 400, "Invalid user ID format");
      }

      await adminService.deleteUser(id);
      return ResponseHelper.success(res, 200, "User deleted successfully", {});
    } catch (error) {
      next(error);
    }
  }

  static async getRevenue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const revenueData = await adminService.getRevenue();
      return ResponseHelper.success(res, 200, "Revenue fetched successfully", revenueData);
    } catch (error) {
      next(error);
    }
  }
}
