import SavedNote from "../models/SavedNote.js";
import Chat from "../models/Chat.js";
import Quiz from "../models/Quiz.js";

export const getDashboardData = async (req, res) => {
    try {

        const userId = req.user._id;

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

            const totalAccuracy = quizHistory.reduce((sum, quiz) => {

                return sum + quiz.accuracy;

            }, 0);

            accuracy = Math.round(totalAccuracy / quizHistory.length);

        }

        const activities = [];

        // Recent Notes
        const recentNotes = await SavedNote.find({
            user: userId,
        })
            .sort({ createdAt: -1 })
            .limit(3);

        recentNotes.forEach((note) => {
            activities.push({
                type: "note",
                text: `📝 Generated notes on "${note.topic}"`,
                date: note.createdAt,
            });
        });

        // Recent Chats
        const recentChats = await Chat.find({
            user: userId,
        })
            .sort({ createdAt: -1 })
            .limit(3);

        recentChats.forEach((chat) => {
            activities.push({
                type: "chat",
                text: `🤖 Asked AI: "${chat.question.substring(0, 35)}..."`,
                date: chat.createdAt,
            });
        });

        // Recent Quizzes
        const recentQuizzes = await Quiz.find({
            user: userId,
        })
            .sort({ createdAt: -1 })
            .limit(3);

        recentQuizzes.forEach((quiz) => {

            activities.push({

                type: "quiz",

                text: `❓ Completed "${quiz.topic}" Quiz (${quiz.score}/${quiz.totalQuestions})`,

                date: quiz.createdAt,

            });

        });

        activities.sort((a, b) => b.date - a.date);

        res.status(200).json({

            success: true,

            dashboard: {

                user: {

                    name: req.user.name,
                    email: req.user.email,

                },

                notes,
                chats,
                quizzes,
                accuracy,
                streak: 1,

                activities,

            },

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Failed to load dashboard",

        });

    }
};