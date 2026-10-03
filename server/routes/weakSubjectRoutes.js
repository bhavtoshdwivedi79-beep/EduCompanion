import express from "express";
import {
    getWeakSubjectAssistance,
    getWeakSubjectSolutions
} from "../controllers/weakSubjectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/assist",
    protect,
    getWeakSubjectAssistance
);

router.post(
    "/solutions",
    protect,
    getWeakSubjectSolutions
);

export default router;