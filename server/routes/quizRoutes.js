import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { saveQuizResult } from "../controllers/quizController.js";

const router = express.Router();

router.post("/save", protect, saveQuizResult);

export default router;