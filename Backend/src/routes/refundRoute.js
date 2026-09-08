import express from "express";
import {
  getRefunds,
  getRefundById,
  createRefund,
  updateRefund,
  deleteRefund,
  processRefund,
} from "../controllers/refundController.js";

const router = express.Router();

router.get("/", getRefunds);
router.get("/:id", getRefundById);
router.put("/:id/process", processRefund);
router.post("/", createRefund);
router.put("/:id", updateRefund);
router.delete("/:id", deleteRefund);

export default router;