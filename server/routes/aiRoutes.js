import express from "express";
import {
    chatWithAI,
    getChatHistory,
} from "../controllers/aiController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protect, chatWithAI);

router.get("/history", protect, getChatHistory);

export default router;