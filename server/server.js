import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);


import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});