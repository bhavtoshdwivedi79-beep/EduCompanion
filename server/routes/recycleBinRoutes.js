import express from "express";

import {
    getRecycleBin,
    restoreRecycleBinItem,
    permanentlyDeleteRecycleBinItem
} from "../controllers/recycleBinController.js";

import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();


// Get all deleted items
router.get(
    "/",
    protect,
    getRecycleBin
);


// Restore item
router.patch(
    "/:type/:id/restore",
    protect,
    restoreRecycleBinItem
);


// Permanently delete item
router.delete(
    "/:type/:id",
    protect,
    permanentlyDeleteRecycleBinItem
);


export default router;