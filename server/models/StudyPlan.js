import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        topic: {
            type: String,
            required: true,
            trim: true,
        },

        studyDate: {
            type: Date,
            required: true,
        },

        studyTime: {
            type: String,
            required: true,
        },

        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium",
        },

        completed: {
            type: Boolean,
            default: false,
        },

        // Reminder kitne minutes pehle aaye
        reminderMinutes: {
            type: Number,
            enum: [10, 15, 20, 30, 60],
            default: 20,
        },

        // Reminder already send hua ya nahi
        reminderSent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("StudyPlan", studyPlanSchema);