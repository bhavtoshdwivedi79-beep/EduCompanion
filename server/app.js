import express from "express";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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

// Home
app.get("/", (req, res) => {
    res.send("🚀 Welcome to EduCompanion API");
});

export default app;