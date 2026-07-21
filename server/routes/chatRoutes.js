import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
    getChatHistory,
    deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();

// Get all chats
router.get("/history", protect, getChatHistory);

// Delete a chat
router.delete("/:id", protect, deleteChat);

export default router;