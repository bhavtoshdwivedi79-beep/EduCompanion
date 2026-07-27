import StudyPlan from "../models/StudyPlan.js";
import updateStreak from "../utils/updateStreak.js";

// Create Task
export const createTask = async (req, res) => {

    try {

        const {
            subject,
            topic,
            studyDate,
            studyTime,
            priority,
        } = req.body;

        if (
            !subject ||
            !topic ||
            !studyDate ||
            !studyTime ||
            !priority
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        const task = await StudyPlan.create({

            user: req.user._id,

            subject,

            topic,

            studyDate,

            studyTime,
            
            priority,

        });

        await updateStreak(req.user._id);

        res.status(201).json({

            success: true,

            message: "Study task created successfully.",

            task,

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to create task.",

        });

    }

};

// Get All Tasks
export const getTasks = async (req, res) => {

    try {

        const tasks = await StudyPlan.find({

            user: req.user._id,

        }).sort({

            studyDate: 1,

            studyTime: 1,

        });

        res.status(200).json({

            success: true,

            tasks,

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to fetch tasks.",

        });

    }

};

// Toggle Complete
export const toggleTask = async (req, res) => {

    try {

        const task = await StudyPlan.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {

            return res.status(404).json({

                success: false,

                message: "Task not found.",

            });

        }

        task.completed = !task.completed;

        await task.save();

        res.status(200).json({

            success: true,

            task,

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to update task.",

        });

    }

};

// Delete Task
export const deleteTask = async (req, res) => {

    try {

        const task = await StudyPlan.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found.",
            });
        }

        res.status(200).json({

            success: true,

            message: "Task deleted successfully.",

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Failed to delete task.",

        });

    }

};