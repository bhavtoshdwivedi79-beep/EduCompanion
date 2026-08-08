import StudyPlan from "../models/StudyPlan.js";
import Notification from "../models/Notification.js";

const checkStudyReminders = async () => {
    try {
        const now = new Date();

        const tasks = await StudyPlan.find({
            completed: false,
            reminderSent: false,
        });

        for (const task of tasks) {

            const [hours, minutes] = task.studyTime
                .split(":")
                .map(Number);

            const deadline = new Date(task.studyDate);

            deadline.setHours(hours);
            deadline.setMinutes(minutes);
            deadline.setSeconds(0);
            deadline.setMilliseconds(0);

            const reminderTime = new Date(
                deadline.getTime() -
                task.reminderMinutes * 60 * 1000
            );

            // Reminder window
            if (
                now >= reminderTime &&
                now < deadline
            ) {

                await Notification.create({
                    user: task.user,
                    message: `⏰ Task pending: "${task.topic}" (${task.subject}) is due in ${task.reminderMinutes} minutes.`,
                    type: "planner",
                });

                task.reminderSent = true;

                await task.save();

                console.log(
                    `🔔 Reminder sent for: ${task.topic}`
                );
            }
        }

    } catch (error) {
        console.log(
            "Reminder service error:",
            error.message
        );
    }
};

export default checkStudyReminders;