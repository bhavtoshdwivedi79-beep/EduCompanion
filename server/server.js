import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
console.log(process.env.MONGO_URI);
// Connect Database
connectDB();

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});