import express from "express";
import {
    chatWithAI,
    getChatHistory,
    generateNotes,
    generateQuiz,
} from "../controllers/aiController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protect, chatWithAI);

router.get("/history", protect, getChatHistory);

router.post("/notes", protect, generateNotes);

router.post("/quiz", protect, generateQuiz);

export default router;