import express from "express";

import {
    getNotifications,
    createNotification,
    markAllRead,
    deleteNotification,
    clearNotifications,
} from "../controllers/notificationController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.post("/", protect, createNotification);

router.put("/read-all", protect, markAllRead);

router.delete("/clear", protect, clearNotifications);

router.delete("/:id", protect, deleteNotification);

export default router;