import { Response, NextFunction } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { UserService } from "../services/user.service.js";
import { ResponseHelper } from "../utils/response.util.js";

const userService = new UserService();

export class UserController {
  static async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(
          res,
          400,
          parsed.error.issues[0].message
        );
      }

      const result = await userService.register(parsed.data);
      return ResponseHelper.success(
        res,
        201,
        "User registered successfully",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parsed = LoginUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return ResponseHelper.error(
          res,
          400,
          parsed.error.issues[0].message
        );
      }

      const result = await userService.login(parsed.data);
      return ResponseHelper.success(res, 200, "Login successful", result);
    } catch (error) {
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
}
