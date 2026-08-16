import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import checkStudyReminders from "./services/reminderService.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {

    try {

        // Connect MongoDB FIRST
        await connectDB();

        // Start server AFTER MongoDB is connected
        app.listen(PORT, () => {

            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`⏰ Study reminder service started`);

        });

        // Check reminders after DB is ready
        checkStudyReminders();

        // Check reminders every minute
        setInterval(() => {

            checkStudyReminders();

        }, 60 * 1000);

    } catch (error) {

        console.error(
            "❌ Failed to start server:",
            error
        );

        process.exit(1);

    }

};

startServer();