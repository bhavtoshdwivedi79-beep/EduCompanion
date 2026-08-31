import SavedNote from "../models/SavedNote.js";
import Quiz from "../models/Quiz.js";
import Flashcard from "../models/Flashcard.js";
import StudyPlan from "../models/StudyPlan.js";

// ==================================================
// GET RECYCLE BIN
// ==================================================

export const getRecycleBin = async (req, res) => {

    try {

        const userId = req.user._id;

        // ------------------------------------------
        // Get deleted notes
        // ------------------------------------------

        const notes = await SavedNote.find({
            user: userId,
            deletedAt: { $ne: null }
        }).lean();


        // ------------------------------------------
        // Get deleted quizzes
        // ------------------------------------------

        const quizzes = await Quiz.find({
            user: userId,
            deletedAt: { $ne: null }
        }).lean();


        // ------------------------------------------
        // Get deleted flashcards
        // ------------------------------------------

        const flashcards = await Flashcard.find({
            user: userId,
            deletedAt: { $ne: null }
        }).lean();

        // ------------------------------------------
        // Get deleted study planner tasks
        // ------------------------------------------

        const studyPlans = await StudyPlan.find({
            user: userId,
            deletedAt: { $ne: null }
        }).lean();


        // ------------------------------------------
        // Add item type
        // ------------------------------------------

        const formattedNotes = notes.map(item => ({
            ...item,
            type: "note"
        }));


        const formattedQuizzes = quizzes.map(item => ({
            ...item,
            type: "quiz"
        }));


        const formattedFlashcards = flashcards.map(item => ({
            ...item,
            type: "flashcard"
        }));

        const formattedStudyPlans = studyPlans.map(item => ({
            ...item,
            type: "study"
        }));


        // ------------------------------------------
        // Combine everything
        // ------------------------------------------

        const recycleBin = [
            ...formattedNotes,
            ...formattedQuizzes,
            ...formattedFlashcards,
            ...formattedStudyPlans
        ];


        // ------------------------------------------
        // Recently deleted → TOP
        // Older deleted → BOTTOM
        // ------------------------------------------

        recycleBin.sort(
            (a, b) =>
                new Date(b.deletedAt) -
                new Date(a.deletedAt)
        );


        res.status(200).json({

            success: true,

            count: recycleBin.length,

            items: recycleBin

        });


    } catch (error) {

        console.error(
            "Recycle Bin Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch recycle bin."

        });

    }

};



// ==================================================
// RESTORE ITEM
// ==================================================

export const restoreRecycleBinItem = async (req, res) => {

    try {

        const { type, id } = req.params;

        const userId = req.user._id;

        let Model;


        // ------------------------------------------
        // Select model
        // ------------------------------------------

        if (type === "note") {

            Model = SavedNote;

        } else if (type === "quiz") {

            Model = Quiz;

        } else if (type === "flashcard") {

            Model = Flashcard;

        } else if (type === "study") {

            Model = StudyPlan;

        } else {

            return res.status(400).json({

                success: false,

                message: "Invalid recycle bin item type."

            });

        }


        // ------------------------------------------
        // Restore item
        // ------------------------------------------

        const item = await Model.findOneAndUpdate(

            {
                _id: id,
                user: userId,
                deletedAt: { $ne: null }
            },

            {
                $unset: {
                    deletedAt: ""
                }
            },

            {
                new: true
            }

        );


        if (!item) {

            return res.status(404).json({

                success: false,

                message: "Recycle bin item not found."

            });

        }


        res.status(200).json({

            success: true,

            message: `${type} restored successfully.`,

            item

        });


    } catch (error) {

        console.error(
            "Restore Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to restore item."

        });

    }

};



// ==================================================
// PERMANENT DELETE
// ==================================================

export const permanentlyDeleteRecycleBinItem =
    async (req, res) => {

        try {

            const { type, id } = req.params;

            const userId = req.user._id;

            let Model;


            // ------------------------------------------
            // Select model
            // ------------------------------------------

            if (type === "note") {

                Model = SavedNote;

            } else if (type === "quiz") {

                Model = Quiz;

            } else if (type === "flashcard") {

                Model = Flashcard;

            } else if (type === "study") {

                Model = StudyPlan;

            } else {

                return res.status(400).json({

                    success: false,

                    message: "Invalid recycle bin item type."

                });

            }


            // ------------------------------------------
            // Permanently delete
            // ------------------------------------------

            const item =
                await Model.findOneAndDelete({

                    _id: id,

                    user: userId,

                    deletedAt: { $ne: null }

                });


            if (!item) {

                return res.status(404).json({

                    success: false,

                    message: "Recycle bin item not found."

                });

            }


            res.status(200).json({

                success: true,

                message:
                    `${type} permanently deleted.`

            });


        } catch (error) {

            console.error(
                "Permanent Delete Error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to permanently delete item."

            });

        }

    };