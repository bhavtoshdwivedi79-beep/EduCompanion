import Flashcard from "../models/Flashcard.js";
import { generateFlashcards } from "../services/geminiService.js";

// Generate AI Flashcards
export const createFlashcards = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Topic is required",
            });
        }

        const cards = await generateFlashcards(topic);

        const flashcard = await Flashcard.create({

            user: req.user._id,
            topic,
            flashcards: cards,

        });

        res.status(201).json({
            success: true,
            flashcard,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to generate flashcards",
        });
    }
};

// Get All Flashcards
export const getFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcard.find({
            user: req.user.id,
        }).sort({
            createdAt: -1,
        });

        res.json({
            success: true,
            flashcards,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// Delete Flashcard
export const deleteFlashcard = async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id);

        if (!flashcard) {
            return res.status(404).json({
                success: false,
                message: "Flashcard not found",
            });
        }

        if (flashcard.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await flashcard.deleteOne();

        res.json({
            success: true,
            message: "Flashcard deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};