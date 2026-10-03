import express from "express";
import multer from "multer";

import { analyzeResult } from "../controllers/resultAnalysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});

// Analyze student result
router.post(
    "/analyze",
    protect,
    upload.single("result"),
    analyzeResult
);

export default router;