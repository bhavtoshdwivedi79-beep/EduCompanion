import express from "express";

import {
    getWeakSubjectAssistance
} from "../controllers/weakSubjectController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/assist",
    protect,
    getWeakSubjectAssistance
);

export default router;