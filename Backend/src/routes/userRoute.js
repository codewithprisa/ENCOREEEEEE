import express from "express";
import {
  getProfile,
  getAllUsers,
  editUser,
  deleteUser,
  promoteUser,
  updatePassword,
} from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyToken, getProfile);
router.get("/", verifyToken, isAdmin, getAllUsers);
router.put("/password", verifyToken, updatePassword);
router.put("/:id", verifyToken, editUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);
router.put("/:id/promote", verifyToken, isAdmin, promoteUser);

export default router;