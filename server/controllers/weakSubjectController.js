import {
    generateWeakSubjectAssistance,
    generateTheorySolutions,
    generateNumericalSolutions
} from "../services/geminiService.js";

export const getWeakSubjectAssistance = async (req, res) => {
    try {
        const {
            subject,
            previousQuestions = []
        } = req.body;

        if (!subject || !subject.trim()) {
            return res.status(400).json({
                success: false,
                message: "Subject is required."
            });
        }

        console.log("📚 Weak subject assistance requested");
        console.log(`📖 Subject: ${subject}`);

        const aiResponse =
            await generateWeakSubjectAssistance(
                subject.trim(),
                previousQuestions
            );

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


export const getWeakSubjectSolutions = async (req, res) => {
    try {
        const {
            type,
            questions = []
        } = req.body;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Solution type is required."
            });
        }

        if (
            !Array.isArray(questions) ||
            questions.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Questions are required."
            });
        }

        if (
            type !== "theory" &&
            type !== "numerical"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid solution type. Use theory or numerical."
            });
        }

        console.log("📚 Solution generation requested");
        console.log(`📝 Type: ${type}`);
        console.log(`📊 Questions: ${questions.length}`);

        let aiResponse;

        if (type === "theory") {
            aiResponse =
                await generateTheorySolutions(questions);
        } else {
            aiResponse =
                await generateNumericalSolutions(questions);
        }

        let solutions;

        try {
            solutions =
                typeof aiResponse === "string"
                    ? JSON.parse(aiResponse)
                    : aiResponse;
        } catch (parseError) {
            console.error(
                "❌ Failed to parse AI solutions:",
                parseError.message
            );

            return res.status(500).json({
                success: false,
                message:
                    "AI returned an invalid solution format."
            });
        }

        if (
            !solutions ||
            typeof solutions !== "object"
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "Invalid solutions received from AI."
            });
        }

        if (!Array.isArray(solutions.solutions)) {
            solutions.solutions = [];
        }

        console.log(
            "✅ Solutions generated successfully."
        );

        return res.status(200).json({
            success: true,
            message: "Solutions generated successfully.",
            data: solutions
        });

    } catch (error) {
        console.error(
            "❌ SOLUTION GENERATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate solutions.",
            error: error.message
        });
    }
};