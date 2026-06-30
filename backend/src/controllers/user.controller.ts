import { Response, NextFunction } from "express";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
  UpdatePasswordDTO,
} from "../dtos/user.dto.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { UserService } from "../services/user.service.js";
import { ResponseHelper } from "../utils/response.util.js";

const userService = new UserService();

export class UserController {
  static async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(res, 400, parsed.error.issues[0].message);
      }

      const result = await userService.register(parsed.data);
      return ResponseHelper.success(res, 201, "User registered successfully", result);
    } catch (error) {
      console.error("Register error:", error);
      next(error);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = LoginUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(res, 400, parsed.error.issues[0].message);
      }

      const result = await userService.login(parsed.data);
      return ResponseHelper.success(res, 200, "Login successful", result);
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      return ResponseHelper.success(res, 200, "Profile retrieved", { user });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/auth/whoami — alias for getProfile
  static async whoami(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      return ResponseHelper.success(res, 200, "User details retrieved", { user });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/auth/update
  static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = UpdateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(res, 400, parsed.error.issues[0].message);
      }

      const updateData = { ...parsed.data };

      // Attach uploaded profile image path if present
      if (req.file) {
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      const user = await userService.updateUser(req.user!.id, updateData);
      return ResponseHelper.success(res, 200, "Profile updated successfully", { user });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/auth/profile-image
  static async updateProfileImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ResponseHelper.error(res, 400, "No image file provided");
      }

      const updateData = {
        profileImage: `/uploads/${req.file.filename}`,
      };

      const user = await userService.updateUser(req.user!.id, updateData);
      return ResponseHelper.success(res, 200, "Profile image updated successfully", { user });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/auth/update-password
  static async updatePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = UpdatePasswordDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(res, 400, parsed.error.issues[0].message);
      }

      await userService.updatePassword(
        req.user!.id,
        parsed.data.currentPassword,
        parsed.data.newPassword
      );

      return ResponseHelper.success(res, 200, "Password updated successfully", {});
    } catch (error) {
      next(error);
    }
  }
}
