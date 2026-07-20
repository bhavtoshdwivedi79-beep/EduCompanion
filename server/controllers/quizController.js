import Quiz from "../models/Quiz.js";

export const saveQuizResult = async (req, res) => {

    try {

        const { topic, score, totalQuestions, accuracy } = req.body;
        console.log(req.user);

        const quiz = await Quiz.create({

            user: req.user._id,

            topic,

            score,

            totalQuestions,

            accuracy,

        });

        console.log("Saved Successfully");

        res.status(201).json({

            success: true,

            message: "Quiz saved successfully.",

            quiz,

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to save quiz.",

        });

    }

};