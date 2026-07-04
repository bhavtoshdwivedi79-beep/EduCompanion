import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.send("🚀 Welcome to EduCompanion API");
});

export default app;