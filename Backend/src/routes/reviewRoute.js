import express from "express";

import {
    createReview,
    getReviewByEvent,
    getReviewSummary
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);

router.get("/event/:eventId", getReviewByEvent);

router.get("/summary/:eventId", getReviewSummary);

export default router;