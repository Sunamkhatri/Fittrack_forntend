import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploads } from "../middlewares/upload.middleware.js";

const router = Router();

// GET /api/v1/users/profile
router.get("/profile", authMiddleware, UserController.getProfile);

// PUT /api/v1/users/profile
router.put("/profile", authMiddleware, UserController.updateUser);

// PUT /api/v1/users/change-password
router.put("/change-password", authMiddleware, UserController.updatePassword);

// POST /api/v1/users/profile-image
router.post(
  "/profile-image",
  authMiddleware,
  uploads.single("profileImage"),
  UserController.updateProfileImage
);

// DELETE /api/v1/users/profile-image
router.delete("/profile-image", authMiddleware, UserController.deleteProfileImage);

// GET /api/v1/users/trainers (List all trainers)
router.get("/trainers", authMiddleware, UserController.getTrainers);

// GET /api/v1/users/clients (List my clients if I am a trainer)
router.get("/clients", authMiddleware, UserController.getClients);

export default router;
