import express from "express";

import {
    createFlashcards,
    saveFlashcards,
    getFlashcards,
    deleteFlashcard,
} from "../controllers/flashcardController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, createFlashcards);

router.post("/save", protect, saveFlashcards);

router.get("/", protect, getFlashcards);

router.delete("/:id", protect, deleteFlashcard);

export default router;