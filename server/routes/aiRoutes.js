import express from "express";
import {
    chatWithAI,
    getChatHistory,
    generateNotes,
    generateQuiz,
    deleteChat,
} from "../controllers/aiController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
    "/chat",
    protect,
    upload.single("file"),
    chatWithAI
);

router.post("/notes", protect, generateNotes);

router.post("/quiz", protect, generateQuiz);

router.get(
    "/history/:conversationId",
    protect,
    getChatHistory
);

export default router;