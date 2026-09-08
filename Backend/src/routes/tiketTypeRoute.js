import express from "express";
import { getTicketTypes, getTicketTypeById, createTicketType, updateTicketType, deleteTicketType, getTicketTypesByEvent } from "../controllers/tiketTypeController.js";

const router = express.Router();

router.get("/", getTicketTypes);
router.get("/:id", getTicketTypeById);
router.post("/", createTicketType);
router.put("/:id", updateTicketType);
router.delete("/:id", deleteTicketType);
router.get("/event/:eventId", getTicketTypesByEvent);

export default router;