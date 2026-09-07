import express from "express";
import multer from "multer";

import {
    generatePDFNotes,
    generatePDFQuiz
} from "../controllers/aiController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
});


// Generate notes
router.post(
    "/notes",
    protect,
    upload.single("pdf"),
    generatePDFNotes
);


// Generate quiz
router.post(
    "/quiz",
    protect,
    upload.single("pdf"),
    generatePDFQuiz
);


export default router;