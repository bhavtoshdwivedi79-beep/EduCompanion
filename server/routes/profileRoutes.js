import express from "express";
import {
    getProfile,
    uploadAvatar,
    removeAvatar,
} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", protect, getProfile);
router.post(
    "/avatar",
    protect,
    upload.single("avatar"),
    uploadAvatar
);

router.delete(
    "/avatar",
    protect,
    removeAvatar
);

export default router;