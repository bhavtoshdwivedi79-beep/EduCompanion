import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
    getConversations,
    createConversation,
    deleteConversation,
    renameConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

router.post("/", protect, createConversation);

router.get("/", protect, getConversations);

router.delete("/:id", protect, deleteConversation);

router.put(
    "/:id",
    protect,
    renameConversation
);

export default router;