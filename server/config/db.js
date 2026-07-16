import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected");
        console.log(conn.connection.host);

    } catch (error) {

        console.error("❌ MongoDB Connection Failed");
        console.error(error);

    }
};

export default connectDB;