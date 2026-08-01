import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        topic: {
            type: String,
            required: true,
            trim: true,
        },

        flashcards: [
            {
                question: {
                    type: String,
                    required: true,
                },

                answer: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;