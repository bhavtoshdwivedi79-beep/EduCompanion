import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import checkStudyReminders from "./services/reminderService.js";

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Start Reminder Service
setInterval(() => {
    checkStudyReminders();
}, 60 * 1000);

// Check once immediately when server starts
checkStudyReminders();

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`⏰ Study reminder service started`);
});