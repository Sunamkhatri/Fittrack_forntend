import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploads } from "../middlewares/upload.middleware.js";

const router = Router();

// Public routes
router.post("/register", UserController.register);
router.post("/signup", UserController.register);
router.post("/login", UserController.login);
router.post("/forgot-password", UserController.forgotPassword);
router.put("/reset-password/:token", UserController.resetPassword);

// Protected routes
router.get("/me", authMiddleware, UserController.getProfile);
router.get("/whoami", authMiddleware, UserController.whoami);
router.put(
  "/update",
  authMiddleware,
  uploads.single("profileImage"),
  UserController.updateUser
);
router.patch(
  "/profile-image",
  authMiddleware,
  uploads.single("image"),
  UserController.updateProfileImage
);
router.put("/update-password", authMiddleware, UserController.updatePassword);

export default router;
