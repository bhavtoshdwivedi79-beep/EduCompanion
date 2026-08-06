import SavedNote from "../models/SavedNote.js";
import Chat from "../models/Chat.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import Flashcard from "../models/Flashcard.js";

const getDayName = (date) => {
    const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
    ];

    return days[new Date(date).getDay()];
};

export const getDashboardData = async (req, res) => {
    try {

        const userId = req.user._id;
        const user = await User.findById(userId);

        // Current Week Start (Sunday)
        const today = new Date();

        const startOfWeek = new Date(today);

        startOfWeek.setDate(today.getDate() - today.getDay());

        startOfWeek.setHours(0, 0, 0, 0);

        const notes = await SavedNote.countDocuments({
            user: userId,
        });

        const chats = await Chat.countDocuments({
            user: userId,
        });

        const quizzes = await Quiz.countDocuments({
            user: userId,
        });

        const flashcards = await Flashcard.countDocuments({
            user: userId,
        });

        const quizHistory = await Quiz.find({
            user: userId,
        });

        const weeklyNotes = await SavedNote.countDocuments({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyChats = await Chat.countDocuments({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyQuizzes = await Quiz.countDocuments({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyFlashcards = await Flashcard.countDocuments({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyNotesData = await SavedNote.find({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyChatsData = await Chat.find({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyQuizzesData = await Quiz.find({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyFlashcardsData = await Flashcard.find({
            user: userId,
            createdAt: { $gte: startOfWeek },
        });

        const weeklyTasks =
            weeklyNotes +
            weeklyChats +
            weeklyQuizzes +
            weeklyFlashcards;

        const progress = Math.min(
            Math.round((weeklyTasks / 20) * 100),
            100
        );

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

        // Recent Flashcards
        const recentFlashcards = await Flashcard.find({
            user: userId,
        })
            .sort({ createdAt: -1 })
            .limit(3);

        recentFlashcards.forEach((flashcard) => {

            activities.push({

                type: "flashcard",

                text: `📚 Generated Flashcards on "${flashcard.topic}"`,

                date: flashcard.createdAt,

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

            if (latest.type === "flashcard") {
                continueRoute = "/flashcards";
            }

        }



        const weekDays = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
        ];

        const weeklyProgress = weekDays.map(day => ({
            day,
            count: 0,
        }));

        const allActivities = [

            ...weeklyNotesData.map(note => ({
                date: note.createdAt,
            })),

            ...weeklyChatsData.map(chat => ({
                date: chat.createdAt,
            })),

            ...weeklyQuizzesData.map(quiz => ({
                date: quiz.createdAt,
            })),

            ...weeklyFlashcardsData.map(card => ({
                date: card.createdAt,
            })),

        ];

        allActivities.forEach(activity => {

            const day = getDayName(activity.date);

            const found = weeklyProgress.find(item => item.day === day);

            if (found) {

                found.count++;

            }

        });

        const calendarActivities = {};
        // Notes
        recentNotes.forEach((note) => {

            const key = note.createdAt.toISOString().split("T")[0];

            if (!calendarActivities[key]) {

                calendarActivities[key] = {
                    notes: [],
                    chats: [],
                    quizzes: [],
                };

            }

            calendarActivities[key].notes.push({

                topic: note.topic,

                createdAt: note.createdAt,

            });

        });

        // Chats
        recentChats.forEach((chat) => {

            const key = chat.createdAt.toISOString().split("T")[0];

            if (!calendarActivities[key]) {

                calendarActivities[key] = {
                    notes: [],
                    chats: [],
                    quizzes: [],
                };

            }

            calendarActivities[key].chats.push({

                question: chat.question,

                createdAt: chat.createdAt,

            });

        });

        // Quizzes
        recentQuizzes.forEach((quiz) => {

            const key = quiz.createdAt.toISOString().split("T")[0];

            if (!calendarActivities[key]) {

                calendarActivities[key] = {
                    notes: [],
                    chats: [],
                    quizzes: [],
                };

            }

            calendarActivities[key].quizzes.push({

                topic: quiz.topic,

                score: quiz.score,

                totalQuestions: quiz.totalQuestions,

                createdAt: quiz.createdAt,

            });

        });

        // Flashcards
        recentFlashcards.forEach((card) => {

            const key = card.createdAt.toISOString().split("T")[0];

            if (!calendarActivities[key]) {

                calendarActivities[key] = {
                    notes: [],
                    chats: [],
                    quizzes: [],
                    flashcards: [],
                };

            }

            if (!calendarActivities[key].flashcards) {
                calendarActivities[key].flashcards = [];
            }

            calendarActivities[key].flashcards.push({

                topic: card.topic,

                createdAt: card.createdAt,

            });

        });

        console.log(calendarActivities);

        // console.log(weeklyProgress);

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
                flashcards,
                accuracy,
                progress,
                streak: user.streak,
                continueRoute,
                weeklyProgress,
                calendarActivities,
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

