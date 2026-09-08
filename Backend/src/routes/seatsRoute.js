import express from "express";
import {
  getSeats,
  getSeatById,
  createSeat,
  updateSeat,
  deleteSeat,
  getSeatsByEvent,
} from "../controllers/seatsController.js";

const router = express.Router();

router.get("/", getSeats);
router.get("/event/:eventId", getSeatsByEvent);
router.get("/:id", getSeatById);

router.post("/", createSeat);
router.put("/:id", updateSeat);
router.delete("/:id", deleteSeat);

export default router;