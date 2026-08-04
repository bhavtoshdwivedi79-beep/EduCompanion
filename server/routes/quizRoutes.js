import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    saveQuizResult,
    getQuizHistory,
    deleteQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/save", protect, saveQuizResult);

router.get("/history", protect, getQuizHistory);

router.delete("/delete/:id", protect, deleteQuiz);

export default router;