import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },

        question: {
            type: String,
            required: true,
        },

        answer: {
            type: String,
            required: true,
        },

        imageUrl: {
            type: String,
            default: "",
        },

        imagePublicId: {
            type: String,
            default: "",
        },

        imageName: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Chat", chatSchema);