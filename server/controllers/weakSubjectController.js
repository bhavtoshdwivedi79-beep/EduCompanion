import { generateWeakSubjectAssistance } from "../services/geminiService.js";

export const getWeakSubjectAssistance = async (req, res) => {
    try {
        const { subject } = req.body;

        if (!subject || !subject.trim()) {
            return res.status(400).json({
                success: false,
                message: "Subject is required."
            });
        }

        console.log("📚 Weak subject assistance requested");
        console.log(`📖 Subject: ${subject}`);

        const aiResponse =
            await generateWeakSubjectAssistance(subject.trim());

        let assistance;

        try {
            assistance =
                typeof aiResponse === "string"
                    ? JSON.parse(aiResponse)
                    : aiResponse;
        } catch (parseError) {
            console.error(
                "❌ Failed to parse AI assistance:",
                parseError.message
            );

            return res.status(500).json({
                success: false,
                message: "AI returned an invalid assistance format."
            });
        }

        if (!assistance || typeof assistance !== "object") {
            return res.status(500).json({
                success: false,
                message: "Invalid assistance received from AI."
            });
        }

        if (!Array.isArray(assistance.theoryQuestions)) {
            assistance.theoryQuestions = [];
        }

        if (!Array.isArray(assistance.numericalQuestions)) {
            assistance.numericalQuestions = [];
        }

        return res.status(200).json({
            success: true,
            message: "Weak subject assistance generated successfully.",
            data: assistance
        });

    } catch (error) {

        console.error(
            "❌ WEAK SUBJECT ASSISTANCE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to generate weak subject assistance.",
            error: error.message
        });
    }
};