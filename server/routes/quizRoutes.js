import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    saveQuizResult,
    getQuizHistory,
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/save", protect, saveQuizResult);

router.get("/history", protect, getQuizHistory);

export default router;