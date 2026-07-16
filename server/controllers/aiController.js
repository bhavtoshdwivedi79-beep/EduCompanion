import Chat from "../models/Chat.js";
import { askAI } from "../services/geminiService.js";

export const chatWithAI = async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // Last 10 chats
        const previousChats = await Chat.find({
            user: req.user._id,
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

        await Chat.create({
            user: req.user._id,
            question: message,
            answer,
        });

        res.status(200).json({
            success: true,
            reply: answer,
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
        }).sort({
            createdAt: 1,
        });

        res.status(200).json({
            success: true,
            chats,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch chat history",
        });

    }

};