import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        topic: {
            type: String,
            required: true,
        },

        score: {
            type: Number,
            required: true,
        },

        totalQuestions: {
            type: Number,
            required: true,
        },

        accuracy: {
            type: Number,
            required: true,
        },

        // ♻️ Recycle Bin
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


// Automatically permanently delete the quiz
// 30 days after it enters the recycle bin.

quizSchema.index(
    { deletedAt: 1 },
    {
        expireAfterSeconds: 30 * 24 * 60 * 60,

        partialFilterExpression: {
            deletedAt: { $type: "date" },
        },
    }
);


export default mongoose.model("Quiz", quizSchema);