import express from "express";

import {
  createFlashcards,
  getFlashcards,
  deleteFlashcard,
} from "../controllers/flashcardController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate AI Flashcards
router.post("/generate", protect, createFlashcards);

// Get User Flashcards
router.get("/", protect, getFlashcards);

// Delete Flashcard Set
router.delete("/:id", protect, deleteFlashcard);

export default router;