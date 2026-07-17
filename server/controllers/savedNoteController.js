import SavedNote from "../models/SavedNote.js";

export const saveNote = async (req, res) => {

    try {

        const { topic, notes } = req.body;

        if (!topic || !notes) {
            return res.status(400).json({
                success: false,
                message: "Topic and notes are required",
            });
        }

        const saved = await SavedNote.create({

            user: req.user._id,

            topic,

            notes,

        });

        res.status(201).json({

            success: true,

            note: saved,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to save note",

        });

    }

};

export const getSavedNotes = async (req, res) => {

    try {

        const notes = await SavedNote.find({
            user: req.user._id,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({

            success: true,

            notes,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to fetch saved notes",

        });

    }

};

export const deleteSavedNote = async (req, res) => {

    try {

        await SavedNote.findOneAndDelete({

            _id: req.params.id,

            user: req.user._id,

        });

        res.status(200).json({

            success: true,

            message: "Note deleted successfully",

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to delete note",

        });

    }

};