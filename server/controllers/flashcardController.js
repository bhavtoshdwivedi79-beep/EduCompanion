import Flashcard from "../models/Flashcard.js";
import { generateFlashcards } from "../services/geminiService.js";


// ==================================================
// GENERATE AI FLASHCARDS
// ==================================================

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

        res.json({

            success: true,

            flashcards: cards,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to generate flashcards",

        });

    }

};


// ==================================================
// SAVE FLASHCARDS
// ==================================================

export const saveFlashcards = async (req, res) => {

    try {

        const { topic, flashcards } = req.body;

        if (!topic || !flashcards) {

            return res.status(400).json({

                success: false,

                message: "Missing Data",

            });

        }

        const saved = await Flashcard.create({

            user: req.user._id,

            topic,

            flashcards,

        });

        res.status(201).json({

            success: true,

            flashcard: saved,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to save flashcards",

        });

    }

};


// ==================================================
// GET ALL ACTIVE FLASHCARDS
// ==================================================

export const getFlashcards = async (req, res) => {

    try {

        const flashcards = await Flashcard.find({

            user: req.user.id,

            deletedAt: null,

        }).sort({

            createdAt: -1,

        });

        res.json({

            success: true,

            flashcards,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server Error",

        });

    }

};


// ==================================================
// DELETE FLASHCARD → RECYCLE BIN
// ==================================================

export const deleteFlashcard = async (req, res) => {

    try {

        const flashcard = await Flashcard.findById(
            req.params.id
        );

        if (!flashcard) {

            return res.status(404).json({

                success: false,

                message: "Flashcard not found",

            });

        }


        // ------------------------------------------
        // Check ownership
        // ------------------------------------------

        if (
            flashcard.user.toString() !==
            req.user.id
        ) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized",

            });

        }


        // ------------------------------------------
        // Move to Recycle Bin
        // ------------------------------------------

        flashcard.deletedAt = new Date();

        await flashcard.save();


        res.json({

            success: true,

            message: "Flashcard moved to recycle bin",

            flashcard,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Server Error",

        });

    }

};