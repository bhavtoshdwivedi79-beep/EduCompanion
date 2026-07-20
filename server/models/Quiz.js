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
},
{
    timestamps: true,
}
);

export default mongoose.model("Quiz", quizSchema);