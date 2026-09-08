import express from "express";
import upload from "../middleware/uploadArtis.js";

import {
  createEvent,
  getEvents,
  getEventById,
  getFeaturedEvents,
  updateEvent,
  deleteEvent,
  saveSeatmap,
} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/featured", getFeaturedEvents);
router.get("/:id", getEventById);
router.put("/:id/seatmap", saveSeatmap);


router.post("/", upload.single("poster"), createEvent);
router.put("/:id", upload.single("poster"), updateEvent);

router.delete("/:id", deleteEvent);

export default router;