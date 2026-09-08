import express from "express";
import upload from "../middleware/uploadArtis.js";
import {
  getAllArtis,
  createArtis,
  updateArtis,
  deleteArtis
} from "../controllers/artisController.js";

const router = express.Router();

router.get("/", getAllArtis);

router.post(
  "/",
  upload.single("photo"),
  createArtis
);

router.put(
  "/:id",
  upload.single("photo"),
  updateArtis
);

router.delete(
  "/:id",
  deleteArtis
);

export default router;