import express from "express";
import {
  getNotifications,
  getNotificationById,
  getNotificationsByUser,
  createNotification,
  readNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.get("/:id", getNotificationById);
router.get("/user/:userId", getNotificationsByUser);

router.post("/", createNotification);

router.patch("/:id/read", readNotification);

router.delete("/:id", deleteNotification);

export default router;