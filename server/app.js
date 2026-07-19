import express from "express";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import savedNoteRoutes from "./routes/savedNoteRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

// CORS
app.use(cors({
    origin: "http://localhost:5173",
}));

// Middleware
app.use(express.json());

// AI Routes
app.use("/api/ai", aiRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/saved-notes", savedNoteRoutes);

app.use("/api/dashboard", dashboardRoutes);

// Home
app.get("/", (req, res) => {
    res.send("🚀 Welcome to EduCompanion API");
});

export default app;