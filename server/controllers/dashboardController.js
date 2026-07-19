import SavedNote from "../models/SavedNote.js";
import Chat from "../models/Chat.js";

export const getDashboardData = async (req, res) => {
    try {

        const userId = req.user._id;

        const notes = await SavedNote.countDocuments({
            user: userId,
        });

        const chats = await Chat.countDocuments({
            user: userId,
        });

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

        activities.sort((a, b) => b.date - a.date);

        res.status(200).json({

            success: true,

            dashboard: {
                notes,
                chats,
                quizzes: 0,
                accuracy: 0,
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