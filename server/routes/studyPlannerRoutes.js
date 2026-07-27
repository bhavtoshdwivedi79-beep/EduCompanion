import express from "express";
import {
    createTask,
    getTasks,
    toggleTask,
    deleteTask,
} from "../controllers/studyPlannerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Study Task
router.post("/", protect, createTask);

// Get All Tasks
router.get("/", protect, getTasks);

// Toggle Complete
router.put("/:id", protect, toggleTask);

// Delete Task
router.delete("/:id", protect, deleteTask);

export default router;