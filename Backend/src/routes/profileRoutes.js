import express from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================================
// GET PROFILE
// ======================================================
router.get(
  "/",
  verifyToken,
  getProfile
);


// ======================================================
// UPDATE PROFILE
// ======================================================
router.put(
  "/",
  verifyToken,
  updateProfile
);


export default router;