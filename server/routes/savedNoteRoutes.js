import express from "express";
import {
    saveNote,
    getSavedNotes,
    deleteSavedNote,
} from "../controllers/savedNoteController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveNote);

router.get("/", protect, getSavedNotes);

router.delete("/:id", protect, deleteSavedNote);

export default router;