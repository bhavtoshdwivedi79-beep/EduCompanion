import { askAI } from "../services/geminiService.js";

export const chatWithAI = async (req, res) => {

    try {

        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        const answer = await askAI(message, history);

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