import Chat from "../models/Chat.js";
import Conversation from "../models/Conversation.js";
import {
    askAI,
    generateNotes as generateNotesAI,
    generateQuizAI,
} from "../services/geminiService.js";

export const chatWithAI = async (req, res) => {

    try {

        const { message, conversationId } = req.body;

        let conversation;

        if (conversationId) {

            conversation = await Conversation.findOne({
                _id: conversationId,
                user: req.user._id,
            });

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message: "Conversation not found",
                });
            }

        } else {

            conversation = await Conversation.create({
                user: req.user._id,
                title: message.substring(0, 40),
            });

        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // Last 10 chats
        const previousChats = await Chat.find({
            user: req.user._id,
            conversation: conversation._id,
        })
            .sort({ createdAt: 1 })
            .limit(10);

        const history = [];

        previousChats.forEach(chat => {

            history.push({
                role: "user",
                content: chat.question,
            });

            history.push({
                role: "assistant",
                content: chat.answer,
            });

        });

        history.push({
            role: "user",
            content: message,
        });

        const answer = await askAI(history);

        // Update title only for first message

        const totalMessages = await Chat.countDocuments({

            conversation: conversation._id,

        });

        if (totalMessages === 0) {

            conversation.title =

                message.length > 40

                    ? message.substring(0, 40) + "..."

                    : message;

            await conversation.save();

        }

        await Chat.create({
            user: req.user._id,
            conversation: conversation._id,
            question: message,
            answer,
        });

        res.status(200).json({

            success: true,

            reply: answer,

            conversationId: conversation._id,

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "AI Error",
        });

    }

};

export const getChatHistory = async (req, res) => {

    try {

        const chats = await Chat.find({
            user: req.user._id,
            conversation: req.params.conversationId,
        }).sort({
            createdAt: 1,
        });

        res.status(200).json({
            success: true,
            chats,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch history",
        });

    }

};

export const deleteChat = async (req, res) => {

    try {

        const chat = await Chat.findOneAndDelete({

            _id: req.params.id,
            user: req.user._id,

        });

        if (!chat) {

            return res.status(404).json({

                success: false,
                message: "Chat not found",

            });

        }

        res.json({

            success: true,
            message: "Chat deleted successfully",

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error",

        });

    }

};

export const generateNotes = async (req, res) => {

    try {

        const { topic } = req.body;

        if (!topic) {

            return res.status(400).json({

                success: false,

                message: "Topic is required",

            });

        }

        const notes = await generateNotesAI(topic);

        res.status(200).json({

            success: true,

            notes,

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to generate notes",

        });

    }

};

export const generateQuiz = async (req, res) => {
    try {

        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Topic is required",
            });
        }

        const quiz = await generateQuizAI(topic);

        res.status(200).json({
            success: true,
            quiz,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to generate quiz",
        });

    }
};