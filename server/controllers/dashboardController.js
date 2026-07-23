import SavedNote from "../models/SavedNote.js";
import Chat from "../models/Chat.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";

export const getDashboardData = async (req, res) => {
    try {

        const userId = req.user._id;
        const user = await User.findById(userId);

        const today = new Date();

        const lastActive = new Date(user.lastActive);

        const diffTime = today.setHours(0, 0, 0, 0) -
            lastActive.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {

            user.streak += 1;
            user.lastActive = new Date();

            await user.save();

        }

        else if (diffDays > 1) {

            user.streak = 1;
            user.lastActive = new Date();

            await user.save();

        }

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
            const totalActivities = notes + chats + quizzes;

            let progress = Math.min(totalActivities * 2, 100);

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
        let continueRoute = "/chat";

        if (activities.length > 0) {

            const latest = activities[0];

            if (latest.type === "note") {
                continueRoute = "/notes";
            }

            if (latest.type === "chat") {
                continueRoute = "/chat";
            }

            if (latest.type === "quiz") {
                continueRoute = "/quiz";
            }

        }

        const totalTasks = notes + chats + quizzes;

        const progress = Math.min(
            Math.round((totalTasks / 20) * 100),
            100
        );

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
                progress,
                streak: user.streak,
                continueRoute,

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