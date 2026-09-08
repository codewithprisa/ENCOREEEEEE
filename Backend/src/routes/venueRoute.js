import express from "express";
import {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenueById
} from "../controllers/venueController.js";

const router = express.Router();

router.get("/", getVenues);
router.get("/:id", getVenueById);
router.post("/", createVenue);
router.put("/:id", updateVenue);
router.delete("/:id", deleteVenue);

export default router;