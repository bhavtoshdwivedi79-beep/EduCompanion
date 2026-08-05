import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {

    createConversation,
    getConversations,
    deleteConversation

} from "../controllers/conversationController.js";

const router = express.Router();

router.post("/", protect, createConversation);

router.get("/", protect, getConversations);

router.delete("/:id", protect, deleteConversation);

export default router;