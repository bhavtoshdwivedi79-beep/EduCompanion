import User from "../models/User.js";
import SavedNote from "../models/SavedNote.js";
import Chat from "../models/Chat.js";
import Quiz from "../models/Quiz.js";

export const getProfile = async (req, res) => {
    try {

        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");

        const notes = await SavedNote.countDocuments({
            user: userId,
        });

        const chats = await Chat.countDocuments({
            user: userId,
        });

        const quizzes = await Quiz.countDocuments({
            user: userId,
        });

        const quizHistory = await Quiz.find({
            user: userId,
        });

        let accuracy = 0;

        if (quizHistory.length > 0) {

            const total = quizHistory.reduce((sum, quiz) => {
                return sum + quiz.accuracy;
            }, 0);

            accuracy = Math.round(total / quizHistory.length);

        }

        res.status(200).json({

            success: true,

            profile: {

                ...user._doc,

                notes,
                chats,
                quizzes,
                accuracy,

            }

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Failed to load profile"

        });

    }
};