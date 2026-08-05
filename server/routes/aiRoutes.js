import express from "express";
import {
    chatWithAI,
    getChatHistory,
    generateNotes,
    generateQuiz,
    deleteChat,
} from "../controllers/aiController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protect, chatWithAI);

router.post("/notes", protect, generateNotes);

router.post("/quiz", protect, generateQuiz);

router.get(
    "/history/:conversationId",
    protect,
    getChatHistory
);

export default router;