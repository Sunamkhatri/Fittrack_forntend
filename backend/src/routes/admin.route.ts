import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";

const router = Router();

router.get("/", AdminController.getUsers);
router.get("/:id", AdminController.getUser);
router.post("/", AdminController.createUser);
router.put("/:id", AdminController.updateUser);
router.delete("/:id", AdminController.deleteUser);
router.get("/revenue/all", AdminController.getRevenue);

export default router;
